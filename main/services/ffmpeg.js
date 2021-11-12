const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const debug = require('debug')('services:ffmpeg');
const {exec, execGetOutput} = require('../utils/exec');
const {formatTime, timeToNumber, numberToTime} = require('../utils/time');
const audioSrv = require('./audio');
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
        `${path.join(__dirname, '../../bin/ffmpeg.exe')} -y -hide_banner ${args}`,
        desc,
        options,
    );
}

async function ffmpegGetOutput(args, desc, callback) {
    return execGetOutput(
        `${path.join(__dirname, '../../bin/ffmpeg.exe')} -y -hide_banner ${args}`,
        desc,
        callback,
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

async function decode(project, callback) {
    const output = `${project.output}/${project.name}/decoded.mp4`;
    const duration = await getMediaDuration(project._source);

    await ffmpegGetOutput(
        `-i "${project._source}" -strict -2 -intra -c:v libx264 -r 24 -tune film -crf 28 -preset fast -profile:v main -c:a aac -ar 44100 -bsf:a aac_adtstoasc -ab 128k "${output}"`,
        `视频转码`,
        (data) => {
            if (data.indexOf('frame') === 0) {
                const array = data.split(/\s+/);
                for (let i = array.length - 1; i >= 0; i--) {
                    if (array[i].indexOf('time=') === 0) {
                        const t = array[i].split('=')[1];
                        const decodeProgress = Math.min((
                            timeToNumber(t) / timeToNumber(duration) * 100
                        ).toFixed(2), 100);
                        callback({
                            decodeProgress,
                        });
                        break;
                    }
                }
            }
        },
    );
    callback({decodeProgress: 100, source: output});
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
        MarginV: 30,
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

async function mergeClips(project) {
    const projectDir = `${project.output}/${project.name}`;

    const videoListSrc = `${projectDir}/video_clip_list.txt`;
    const videoList = [];
    project.clips.forEach(function(clip) {
        if (clip.src) {
            videoList.push(`file ${clip.src.replace(/\?.+/, '')}`);
        }
    });
    fs.writeFileSync(videoListSrc, videoList.join('\n'));

    const output = `${projectDir}/preview.mp4`;
    await ffmpeg(
        `-f concat -safe 0 -i "${videoListSrc}" -profile:v main -movflags +faststart "${output}"`,
        '片段合成',
    );
    return output;
}

async function getPoster(src, output) {
    await ffmpeg(
        `-y -ss 0 -i "${src}" -vframes 1 "${output}"`,
        '生成视频封面',
    );
}

async function getBgMusic(project, video) {
    if (!project.bgMusic) {
        return null;
    }
    const bgSrc1 = `${project.output}/${project.name}/背景音乐.wav`;
    const duration = await getMediaDuration(video);
    await ffmpeg(
        `-i "${project.bgMusic}" ${bgSrc1}`,
        '提取背景音乐',
    );
    const bgSrc2 = `${project.output}/${project.name}/背景音乐循环.wav`;
    await ffmpeg(
        `-stream_loop -1 -i "${bgSrc1}" -af "volume=${(project.bgVolume || 100) / 100}" -t ${duration} ${bgSrc2}`,
        '调整背景音乐声音大小',
    );
    return bgSrc2;
}

async function exportVedio(project, ratio) {
    const mergeSrc = await mergeClips(project);
    let video;
    if (ratio === '16/9') {
        video = `${project.output}/${project.name}/${project.name}_16_9.mp4`;
        await ffmpeg(
            `-i "${mergeSrc}" -vf "scale=1920:-1:pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=sar=1/1,setdar=dar=16/9" -c:a copy ${video}`,
            `视频转码`,
        );
    } else {
        video = `${project.output}/${project.name}/${project.name}_9_16.mp4`;
        await ffmpeg(
            `-i "${mergeSrc}" -vf "scale=1080:-1,pad=1080:1920:0:(oh-ih)/2,setsar=sar=1/1,setdar=dar=9/16" -c:a copy ${video}`,
            `视频转码`,
        );
    }
    const bgMusic = await getBgMusic(project, video);
    const output = `${project.output}/${project.name}/${project.name}.mp4`;
    await ffmpeg(
        `-i ${video} -i ${bgMusic} -filter_complex "[0:a][1:a]amerge[a]" -map 0:v -map "[a]" ${output}`,
        '合成视频、音频 [3/3]',
    );
}

module.exports = {
    clip,
    getPoster,
    decode,
    mergeClips,
    exportVedio,
};
