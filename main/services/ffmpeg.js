const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const debug = require('debug')('services:ffmpeg');
const {exec, execGetOutput} = require('../utils/exec');
const {formatTime, timeToNumber, numberToTime} = require('../utils/time');
const audioSrv = require('./audio');
const config = require('../config');
// const projectSrv = require('./projects');
const {app} = require('electron');

/**
 * 执行ffmpeg命令
 * @param {string} args
 * @param {string} desc
 * @param {string} options
 * @return {Promise}
 */
async function ffmpeg(args, desc, options) {
    return exec(
        // `${path.join(__dirname, '../../bin/ffmpeg.exe')} -y -hide_banner -loglevel error ${args}`,
        `${path.join(__dirname, '../../bin/ffmpeg.exe')} -y -hide_banner ${args}`,
        desc,
        options,
    );
}

/**
 * 执行ffprobe命令
 * @param {string} args
 * @param {string} desc
 * @return {Promise}
 */
async function ffprobe(args, desc) {
    return execGetOutput(`${path.join(__dirname, '../../bin/ffprobe.exe')} ${args}`, desc);
}

/**
 * 快速切分抖音视频
 * @param {object} params 切割的参数
 */
async function dyClip(params) {
    const {source, output, clips} = params;
    const video = `${output}/douyin_all.mp4`;
    await exec(
        `${ffmpeg} -y -hide_banner -loglevel error -i "${source}" -vf "scale=1080:-1,pad=1080:1920:0:(oh-ih)/2" -c:a copy "${video}"`,
        `转换视频分辨率`,
    );
    for (let i = 0; i < clips.length; i++) {
        const clip = JSON.parse(clips[i]);
        if (!clip.start) {
            continue;
        }
        if (!clip.end) {
            clip.end = await getMediaDuration(source);
        }
        await exec(
            `ffmpeg -y -hide_banner -loglevel error -i "${video}" -ss ${clip.start} -to ${clip.end} -c:a copy "${output}/douyin_0${i + 1}.mp4"`,
            `开始切割第${i + 1}个片段`,
        );
    }
}

/**
 * 转成都是关键帧的视频，才能正确的切割和同步原声
 */
async function intraSource(project) {
    const config = projectSrv.getProjectConf(project);
    const output = `${projectSrv.getDir(project)}/intra.mp4`;
    projectSrv.updateConfig(project, {intra: '', intra_percentage: 0});
    const duration = await getMediaDuration(config.source);

    await execGetOutput(
        `ffmpeg -hide_banner -y -i "${config.source}" -strict -2 -intra -c:v libx264 -r 24 -tune film -crf 28 -preset fast -profile:v main -vf "scale=w=1920:h=1080:force_original_aspect_ratio=2,crop=1920:1080,setsar=sar=1/1,setdar=dar=16/9" -c:a aac -ar 44100 -bsf:a aac_adtstoasc -ab 128k ${output}`,
        `视频转码`,
        (data) => {
            if (data.indexOf('frame') === 0) {
                const array = data.split(/\s+/);
                for (let i = array.length - 1; i >= 0; i--) {
                    if (array[i].indexOf('time=') === 0) {
                        const t = array[i].split('=')[1];
                        const percentage = (timeToNumber(t) / timeToNumber(duration) * 100).toFixed(2);
                        projectSrv.updateConfig(project, {intra: '', intra_percentage: percentage});
                        break;
                    }
                }
            }
        },
    );
    projectSrv.updateConfig(project, {intra: output, intra_percentage: 100});
}

/**
 * 剪辑视频片段
 * @param {*} project
 * @param {*} clip
 * @param {*} duration
 */
async function clipVideo(project, clip, duration) {
    const output = `${project.clipDir}/${clip.id}/video_clip.mp4`;
    await ffmpeg(
        `-ss ${clip.start} -i "${clip.source}" -to ${duration} -intra -c copy ${output}`,
        '裁剪视频',
    );
    return output;
}

async function getVideoSound(project, clip, video, volume) {
    const output = `${project.clipDir}/${clip.id}/originSound.mp3`;
    await ffmpeg(
        `-i ${video} -vn -map a -filter:a "volume=${volume/100}" ${output}`,
        '提取视频原声',
    );
    return output;
}

/**
 * 合成片段语音
 * @param {object} project
 * @param {object} clip
 * @return {array} [audioSrc, srtSrc]
 */
async function generateClipTTS(project, clip) {
    const clipDir = `${project.clipDir}/${clip.id}`;

    debug(`开始合成语音 ...`);
    const originSrc = `${clipDir}/audio_tts_origin.wav`;
    const aSrc = `${clipDir}/audio_tts.wav`; // 音频输出路径
    audioSrv.save(await audioSrv.requestAudio({
        ...project.voice,
        text: clip.srt,
    }), originSrc);
    await ffmpeg(
        `-i ${originSrc} -af "afade=t=in:st=0:d=0.1" ${aSrc}`,
        `音频淡入处理`,
    );
    const sSrc = `${clipDir}/subtitle.srt`; // 字幕输出路径
    await textToSrt(sSrc, clip.srt, await getMediaDuration(aSrc));

    return [aSrc, sSrc];
}

async function adjustAudioDuration(output, silenctOutput, duration, ...inputs) {
    inputs = inputs.filter((i) => i);
    const inputString = inputs.map((i) => i ? `-i ${i}` : '').join(' ');
    await exec(`ffmpeg -y -hide_banner -loglevel error -f lavfi -i anullsrc -t ${duration} -ar 44100 ${silenctOutput}`, '生成视频长度的静音频');
    await exec(`ffmpeg -y -hide_banner -loglevel error ${inputString} -i ${silenctOutput} -filter_complex "amix=inputs=${inputs.length+1}:duration=longest" ${output}`, '合并原声、配音、静音频');
}

/**
 * 生成字幕文件
 * @param {string} output
 * @param {string} input
 * @param {string} duration
 */
async function textToSrt(output, input, duration) {
    debug(`开始生成字幕 ...`);
    input = input.trim();
    const average = timeToNumber(duration) / input.replace(/\n/g, '').length;
    const lines = input.split(/\s*\n\s*/);
    let start = 0;
    // 清空文件内容
    fs.writeFileSync(output, '');
    // 逐行写入
    for (let i = 0; i < lines.length; i++) {
        const text = lines[i];
        const end = start + text.length * average;
        const data = [
            i + 1,
            `${numberToTime(start).replace('.', ',')} --> ${numberToTime(end).replace('.', ',')}`,
            `${text}`,
            '\n',
        ];
        debug(`${data.join(' ')}`);
        fs.appendFileSync(output, data.join('\n'));
        start = end;
    }
    debug('生成字幕完成!');
}

async function getMediaDuration(src) {
    const duration = await ffprobe(
        `-i "${src}" -show_entries format=duration -v quiet -of csv="p=0" -sexagesimal`,
        '获取媒体时长',
    );
    return formatTime(duration);
}

async function mergeTTS(output, audio, video) {
    const command = `ffmpeg -y -hide_banner -loglevel error -i ${video} -i ${audio} -strict experimental -map 0:v:0 -qscale 0 -map 1:a:0 ${output}`;
    await exec(command, '合并视频、音频');
}

async function mergeSrt(project, clip, video, srt) {
    const output = `${project.clipDir}/${clip.id}/video_srt.mp4`;
    const style = qs.stringify({
        Fontname: '宋体',
        Fontsize: 20,
        PrimaryColour: '&HF5F5F5',
        Bold: -1,
        BorderStyle: 1,
        Outline: 1,
        Shadow: 0,
        Alignment: 2,
        MarginV: 10,
        Spacing: -0.5,
    }, ',', '=', {encodeURIComponent: (a) => a});
    const srtDir = path.resolve(path.dirname(srt)).replace(/\\/g, '/');
    const srtName = path.basename(srt);
    await ffmpeg(
        `-i "${video}" -vf "subtitles=${srtName}:force_style='${style}'" "${output}"`,
        '合并字幕',
        {cwd: srtDir},
    );
    return output;
}

async function generateEmptyAudio(duration, desc) {
    const output = `${app.getPath('temp')}/empty_audio_${Date.now()}.mp3`;
    await ffmpeg(
        `-f lavfi -i anullsrc -t ${duration} -ar 44100 ${output}`,
        desc || '生成空白音频',
    );
    return output;
}

async function mergeAudio(inputs, desc) {
    inputs = inputs.filter((i) => i);
    if (inputs.length === 1) {
        return inputs[0];
    }
    const output = `${app.getPath('temp')}/merge_audio_${Date.now()}.mp3`;
    const inputString = inputs.map((i) => i ? `-i "${i}"` : '').join(' ');
    await ffmpeg(
        `${inputString} -filter_complex "amix=inputs=${inputs.length}:duration=longest" "${output}"`,
        desc || '合并音频',
    );
    return output;
}

async function mergeVideoAudio(project, clips, video, audio) {
    const output = `${project.clipDir}/${clips.id}/video.mp4`;
    const videoDuration = await getMediaDuration(video);
    const audioDuration = audio ? await getMediaDuration(audio) : 0;
    if (videoDuration !== audioDuration) {
        const emptyAudio = await generateEmptyAudio(videoDuration, '合成视频、音频 [1/3]');
        const adjustedAudio = await mergeAudio([audio, emptyAudio], '合成视频、音频 [2/3]');
        await ffmpeg(
            `-i "${video}" -i "${adjustedAudio}" -strict experimental -map 0:v:0 -qscale 0 -map 1:a:0 "${output}"`,
            '合成视频、音频 [3/3]',
        );
    } else {
        await ffmpeg(
            `-i ${video} -i ${audio} -strict experimental -map 0:v:0 -qscale 0 -map 1:a:0 ${output}`,
            '合成视频、音频 [3/3]',
        );
    }
    return output;
}

/**
 * 自动配音
 * @param {object} project
 * @param {object} clip
 * @return {string} path of cliped video
 */
async function clipWithAutoSound(project, clip) {
    // 合成语音
    const [ttsSrc, subtitle] = await generateClipTTS(project, clip);
    // 剪切视频
    const startVal = timeToNumber(clip.start);
    let endVal;
    if (clip.end) {
        endVal = timeToNumber(clip.end);
    } else {
        endVal = startVal + timeToNumber(await getMediaDuration(ttsSrc)) + 200;
    }
    clip.end = numberToTime(endVal);
    const duration = numberToTime(endVal - startVal);
    const clipedVideo = await clipVideo(project, clip, duration);
    // 合并字幕
    const videoWithSrt = await mergeSrt(project, clip, clipedVideo, subtitle);
    // 处理视频原声
    if (+clip.originSound) {
        const originSoundSrc = await getVideoSound(
            project, clip, clipedVideo, clip.originSoundVolume,
        );
        const audioSrc = await mergeAudio([ttsSrc, originSoundSrc]);
        const src = await mergeVideoAudio(
            project, clip, videoWithSrt, audioSrc,
        );
        return src;
    } else {
        const src = await mergeVideoAudio(project, clip, videoWithSrt, ttsSrc);
        return src;
    }
}

/**
 * 不自动配音
 * @param {*} project
 * @param {*} clip
 */
async function clipWithoutAutoSound(project, clip) {
    const clipDir = `${project.clipDir}/${clip.id}`;
    const startVal = timeToNumber(clip.start);
    const endVal = timeToNumber(clip.end);
    clip.end = numberToTime(endVal);
    // 裁剪视频
    let video = await clipVideo(
        project, clip, numberToTime(endVal - startVal),
    );
    // 嵌入字幕
    if (clip.srt) {
        const sSrc = `${clipDir}/sutitles.srt`;
        await textToSrt(sSrc, clip.srt, await getMediaDuration(video));
        video = await mergeSrt(project, clip, video, sSrc);
    }
    // 需要原声就直接返回
    if (+clip.originSound) {
        const originSoundSrc = await getVideoSound(
            project, clip, video, clip.originSoundVolume,
        );
        return await mergeVideoAudio(project, clip, video, originSoundSrc);
    }

    return await mergeVideoAudio(project, clip, video);
}

async function clip(project, clip) {
    if (!fs.existsSync(`${project.clipDir}/${clip.id}`)) {
        fs.mkdirSync(`${project.clipDir}/${clip.id}`, {recursive: true});
    }

    let src;
    if (+clip.autoSound && clip.srt) {
        src = await clipWithAutoSound(project, clip);
    } else {
        src = await clipWithoutAutoSound(project, clip);
    }

    const poster = `${project.clipDir}/${clip.id}/poster.jpeg`;
    await getPoster(src, poster);

    clearDir(`${project.clipDir}/${clip.id}`, [src, poster]);

    return {
        ...clip,
        poster,
        src,
    };
}

async function clearDir(dir, excludes=[]) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filepath = `${dir}/${file}`;
        if (excludes.indexOf(filepath) < 0) {
            fs.rmSync(filepath);
        }
    });
}

/**
 *
 * @returns
 */
async function exportVideo(options) {
    debug('开始导出视频...');
    const name = options.project;
    const dir = projectSrv.getDir(name);
    const projectConf = projectSrv.getProjectConf(name);

    const videoListSrc = `${dir}/video_list.txt`;
    const videoList = [];
    projectConf.clips.forEach(function(clip) {
        videoList.push(`file ${config.STATIC_DIR}/${clip.src.replace(/\?.+/, '')}`);
    });

    fs.writeFileSync(videoListSrc, videoList.join('\n'));

    const vSrc = `${dir}/video.mp4`;
    await exec(
        `ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i ${videoListSrc} -profile:v main -movflags +faststart ${vSrc}`,
        '导出视频',
    );

    projectSrv.updateConfig(name, {output: vSrc});
    return vSrc;
}

async function copyBg(project, src) {
    const dir = projectSrv.getDir(project);
    const output = `${dir}/bg.wav`;
    await exec(
        ` ffmpeg -y -hide_banner -loglevel error -i "${src}" ${output}`,
        '合并视频',
    );
    return output;
}

async function mergeBackground(params) {
    const project = params.project;
    const volume = params.volume;
    const dir = projectSrv.getDir(project);
    const projectConf = projectSrv.getProjectConf(project);
    const vSrc = projectConf.output;
    const bgSrc = projectConf.bg_audio;
    if (fs.existsSync(bgSrc) && fs.existsSync(vSrc)) {
        const output = `${dir}/video_bg.mp4`;
        // ffmpeg -y -hide_banner -i .\video.mp4 -stream_loop -1 -i .\bg.mp3 -filter_complex '[1:a]volume=0.1[a1];[0:a][a1]amix=duration=first[aout]' -map [aout]:0 -map 0:v:0 -y ./video_bg.mp4
        // ffmpeg -y -hide_banner -loglevel error -i ./bg.mp3 -q:a 0 -map a -vn -filter:a "volume=0.1" ./bg1.mp3
        const duration = await getMediaDuration(vSrc);
        const volumeAudio = `${dir}/bg_volume.wav`;
        projectSrv.updateConfig(project, {bg_percentage: 0});
        await exec(
            `ffmpeg -hide_banner -loglevel error -y -i "${bgSrc}" -af "volume=${volume / 100}" ${volumeAudio}`,
            '调整背景音乐声音大小',
        );
        await execGetOutput(
            `ffmpeg -hide_banner -y -i ${vSrc} -stream_loop -1 -i ${volumeAudio} -filter_complex [0:a][1:a]amix -t ${duration} ${output}`,
            '合成背景音乐',
            (data) => {
                if (data.indexOf('frame') === 0) {
                    const array = data.split(/\s+/);
                    for (let i = array.length - 1; i >= 0; i--) {
                        if (array[i].indexOf('time=') === 0) {
                            const t = array[i].split('=')[1];
                            const percentage = (timeToNumber(t) / timeToNumber(duration) * 100).toFixed(2);
                            projectSrv.updateConfig(project, {bg_percentage: percentage});
                            break;
                        }
                    }
                }
            },
        );
        debug('背景音乐合成成功！');
        projectSrv.updateConfig(project, {output_v_bg: output});
        return output;
    }
}

async function getPoster(src, output) {
    await ffmpeg(
        `-y -ss 0 -i "${src}" -vframes 1 "${output}"`,
        '生成视频封面',
    );
}

module.exports = {
    clip,
    getPoster,
};
