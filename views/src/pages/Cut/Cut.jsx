import React from "react";
import { Link } from 'react-router-dom';
import moment from 'moment';
import ReactAwesomePlayer from 'react-awesome-player'
import {
    LoadingOutlined, CheckCircleFilled, ExportOutlined,
    ManOutlined, WomanOutlined, PlusCircleFilled,
    PlaySquareOutlined,
}from '@ant-design/icons';
import {
    Button, message, Spin,
    Panel, Layout, Space, Modal,

} from '../../components';
import Clip from './Clip';
import namespace from '../../utils/namespace';
import { confirm } from '../../utils/modal';

import './Cut.scss';
import invoke from "../../utils/invoke";

const cls = namespace('bee-cut');

const ratioMap = {
    xigua: '16/9',
    douyin: '9/16',
};

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project: null,
            clips: [],
            saving: false,
            previewVisible: false,
            previewSrc: '',
            previewLoading: false,
            exportModalVisible: false,
            exportRatio: ratioMap.xigua,
        };
        this.playerOptions = {};
        this.sourcePalyerOptions = {};
        this.clipsRef = React.createRef();
    }

    async componentDidMount() {
        const project = await invoke('get:/projects', this.props.match.params.id);
        const clips = project.clips && project.clips.length ? project.clips : [this.getNewClip()];
        this.setState({ project, clips });
    }

    setXiguaRatio = () => {
        this.setState({ exportRatio: ratioMap.xigua });
    }

    setDouyinRatio = () => {
        this.setState({ exportRatio: ratioMap.douyin });
    }

    getNewClip() {
        return {
            id: `${Math.floor(new Date().getTime() * Math.random())}`,
            start: '',
            end: '',
            srt: '',
            src: '',
            loading: false,
            originSound: 0,
            originSoundVolume: 100,
            autoSound: 1,
        };
    }

    getSourcePlayerOptions() {
        if (this.sourcePalyerOptions._source !== this.state.project.source) {
            this.sourcePalyerOptions = {
                _source: this.state.project.source,
                preload: 'auto',
                sources: [{
                    type: `video/mp4`,
                    src: this.state.project.source
                }],
            };
        }

        return this.sourcePalyerOptions;
    }

    getPlayerOptions(clip) {
        if (!this.playerOptions[clip.id] || this.playerOptions[clip.id].sources[0].src !== clip.src) {
            this.playerOptions[clip.id] = {
                poster: clip.poster,
                preload: 'none',
                sources: [{
                    type: `video/mp4`,
                    src: clip.src
                }],
            };
        }

        return this.playerOptions[clip.id];
    }

    onSourceChange = (e) => {
        const file = e.target.files[0];
        const source = file ? file.path : null;
        this.setState(({ project }) => ({
            project: { ...project, source }
        }), () => {
            this.saveProject();
        });
    }

    formatTime(time) {
        window.moment = moment;
        return moment(time, 'HH:mm:ss.SSS').format('HH:mm:ss.SSS')
    }

    onClip = (e, data) => {
        if (!this.state.project.source) {
            message.error('请先导入影片');
            return;
        }
        this.clip({
            ...data,
            source: this.state.project.source,
        });
    };

    clip = async (data) => {
        data.start = this.formatTime(data.start);
        data.end = data.end && this.formatTime(data.end);

        if (!data.end && !(data.srt && (data.autoSound === undefined ? true : +data.autoSound))) {
            message.error('结束时间和配音不能同时为空');
            return;
        }

        this.updateClip(data.id, {
            loading: true,
        }, false);

        try {
            const clip = await invoke('post:/projects/clip', {
                clip: {
                    ...data,
                    srt: (data.srt || '').trim(),
                },
                project: this.state.project,
            });

            this.updateClip(data.id, {
                ...clip,
                loading: false,
                poster: `${clip.poster.replace(/\\/g, '/')}?_=${Date.now()}`,
                src: `${clip.src.replace(/\\/g, '/')}?_=${Date.now()}`
            });
        } catch (e) {
            this.updateClip(data.id, {
                loading: false,
            }, false);
        }
    }

    clipAll = () => {
        confirm('确定要重新生成所有视频片段吗？这可能需要等很久。').then(() => {
            this.state.clips.forEach((data) => {
                this.clip(data);
            });
        });
    }

    addClip = (e, d, index) => {
        const isLastClip = index === this.state.clips.length - 1;
        this.state.clips.splice(index + 1, 0, this.getNewClip());
        this.updateClips(this.state.clips, true, () => {
            if (isLastClip) {
                this.clipsRef.current.scrollLeft += 300;
            }
        });
    }

    deleteClip = (e, data, index) => {
        const doDelete = () => {
            this.state.clips.splice(index, 1);
            this.updateClips(this.state.clips);
        };
        if (data.src) {
            confirm('确定要删除片段吗？此操作不可恢复。').then(doDelete);
        } else {
            doDelete();
        }
    }

    saveProject = () => {
        clearTimeout(this.saveTimeout);
        this.setState({ saving: true });
        this.saveTimeout = setTimeout(async () => {
            const project = await invoke('put:/projects', {
                ...this.state.project,
                clips: this.state.clips,
            });
            this.setState({ project, saving: false });
        }, 300);
    }

    onStartChange = (e, data) => {
        this.updateClip(data.id, { start: e.target.value });
    }

    onEndChange = (e, data) => {
        this.updateClip(data.id, { end: e.target.value });
    }

    onStrChange = (e, data) => {
        this.updateClip(data.id, { srt: e.target.value });
    }

    onAutoSoundChange = (e, data) => {
        this.updateClip(data.id, { autoSound: +e.target.checked });
    }

    onOriginSoundChange = (e, data) => {
        this.updateClip(data.id, { originSound: +e.target.checked });
    }

    onoriginSoundVolumeChange = (value, data) => {
        this.updateClip(data.id, { originSoundVolume: value });
    }

    getClipIndex(data) {
        const id = data.id || data;
        for (let i = 0; i < this.state.clips.length; i++) {
            let clip = this.state.clips[i];
            if (clip.id === id) {
                return i;
            }
        }
        return -1;
    }

    updateClip(id, data, save) {
        const index = this.getClipIndex(id);
        const clips = this.state.clips;
        const clip = {
            ...clips[index],
            ...data,
        };
        clips[index] = clip;
        this.updateClips(clips, save);
    }

    updateClips(clips, save = true, callback) {
        this.setState({ clips: [...clips] }, callback);
        save && this.saveProject();
    }

    previewVedio = async () => {
        this.setState({ previewLoading: true, previewSrc: '', previewVisible: true });
        const src = await invoke('get:/projects/preview', this.state.project);
        this.setState({ previewLoading: false, previewSrc: src });
    }

    onPreviewClose = () => {
        this.setState({ previewVisible: false });
    }

    showExportVideo = () => {
        this.setState({ exportModalVisible: true });
    }

    exportClose = () => {
        this.setState({ exportModalVisible: false });
    }

    exportVideo = () => {
        invoke('get:/projects/export', {
            project: this.state.project,
            ratio: this.state.exportRatio,
        });
    }

    render() {
        const loadingCount = this.state.clips.reduce((ret, clip) => {
            if (clip.loading) {
                ret++;
            }
            return ret;
        }, 0);

        if (!this.state.project) {
            return null;
        }

        return (
            <>
                <Layout.Header className={cls('header')}>
                    {this.state.saving ? (
                        <span className={cls('saving')}>
                            <LoadingOutlined /> 保存中 ...
                            <span>({this.state.clips.length - loadingCount}/{this.state.clips.length})</span>
                        </span>
                    ) : (
                        <span className={cls('saved')}>
                            <CheckCircleFilled />
                            {this.state.project.updateTime ? this.state.project.updateTime.split(/\s+/)[1] : '' }
                            <span> 已自动保存</span>
                        </span>
                    )}
                    <span className={cls('name')}>{this.state.project && this.state.project.name}</span>
                    <span className={cls('buttons')}>
                        <Button type="primary" onClick={this.showExportVideo}>
                            <ExportOutlined />导出
                        </Button>
                        <Modal.Panel
                            title="导出"
                            visible={this.state.exportModalVisible}
                            onCancel={this.exportClose}
                            onOk={this.exportVideo}
                        >
                            <div className={cls('export-modal')}>
                                <div className={cls('export-preview')}>
                                    <div
                                        className={cls('export-img')}
                                        style={{
                                            backgroundImage: `url(${this.state.project.poster.replace(/\\/g, '/')})`,
                                            ...(this.state.exportRatio === ratioMap.xigua ? {
                                                width: 320,
                                                height: 180,
                                            } : {
                                                width: 180,
                                                height: 320,
                                            })
                                        }}
                                    />

                                </div>
                                <div className={cls('export-ratio')}>
                                    <div onClick={this.setXiguaRatio}>
                                        <div className={cls('export-ratio-16-9')}></div>
                                        <p>16:9（西瓜）</p>
                                    </div>
                                    <div onClick={this.setDouyinRatio}>
                                        <div className={cls('export-ratio-9-16')}></div>
                                        <p>9:16（抖音）</p>
                                    </div>
                                </div>
                            </div>
                        </Modal.Panel>
                    </span>
                </Layout.Header>
                <Layout.Content className={cls('content')}>
                    <div className={cls('col-3')}>
                        <Panel className={cls('player')}>
                            <Panel.Header>播放器</Panel.Header>
                            <Panel.Content>
                                {
                                    this.state.project.source ? (
                                        <div className={cls('player-container')}>
                                            <div className={cls('awesome-player')}>
                                                <ReactAwesomePlayer
                                                    options={this.getSourcePlayerOptions()}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={cls('player-no-source')}>
                                            <div className={cls('filepicker')}>
                                                <input type="file" onChange={this.onSourceChange} />
                                                <PlusCircleFilled /> 导入影片
                                            </div>
                                        </div>
                                    )
                                }
                            </Panel.Content>
                        </Panel>
                        <Panel className={cls('settings')}>
                            <Panel.Header>设置</Panel.Header>
                            <Panel.Content className={cls('project-info')}>
                                <div><span>作品名称：</span><span>{this.state.project.name}</span></div>
                                <div><span>影片路径</span><span>{this.state.project._source}</span></div>
                                <div><span>保存位置：</span><span>{this.state.project.output}</span></div>
                                <div><span>背景音乐：</span><span>{this.state.project.bgMusic}</span></div>
                                <div>
                                    <span>自动配音：</span>
                                    <span>
                                        {
                                            this.state.project.voice.sex === '男'
                                                ? <ManOutlined className={cls('boy')} />
                                                : <WomanOutlined className={cls('girl')} />
                                        }
                                        {this.state.project.voice.nickname}
                                        <span>（{this.state.project.voice.desc}）</span>
                                    </span>
                                </div>
                                <div><span>AppKey：</span><span>{this.state.project.AppKey}</span></div>
                                <div><span>AppToken：</span><span>{this.state.project.AppToken}</span></div>
                            </Panel.Content>
                            <Panel.Footer style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button type="" onClick={this.clipAll} loading={loadingCount} long>
                                        应用
                                        {
                                            !!loadingCount && (
                                                <span>({this.state.clips.length - loadingCount}/{this.state.clips.length})</span>
                                            )
                                        }
                                    </Button>
                                    <Link to={`/projects/edit/${this.state.project.id}`}>
                                        <Button long>修改</Button>
                                    </Link>
                                </Space>
                            </Panel.Footer>
                        </Panel>
                    </div>
                    <Panel className={cls('clips-panel')}>
                        <Panel.Header style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className={cls('info')}>
                                <div>片段: {this.state.clips.length}个</div>
                                <div>总时长: {this.state.project.duration}</div>
                            </div>
                            <Space>
                                <Button className={cls('preview-button')} onClick={this.previewVedio} long>
                                    <PlaySquareOutlined />
                                </Button>
                            </Space>
                        </Panel.Header>
                        <Panel.Content ref={this.clipsRef} className={cls('clips')}>
                            <Space size={8}>
                                {
                                    this.state.clips.map((clip, i) => {
                                        return (
                                            <Clip
                                                key={clip.id}
                                                data={clip}
                                                index={i}
                                                videoOptions={this.getPlayerOptions(clip)}
                                                onStartChange={this.onStartChange}
                                                onEndChange={this.onEndChange}
                                                onStrChange={this.onStrChange}
                                                onAutoSoundChange={this.onAutoSoundChange}
                                                onOriginSoundChange={this.onOriginSoundChange}
                                                onoriginSoundVolumeChange={this.onoriginSoundVolumeChange}
                                                onClip={this.onClip}
                                                deleteClip={this.deleteClip}
                                                addClip={this.addClip}
                                            />
                                        );
                                    })
                                }
                            </Space>
                        </Panel.Content>
                    </Panel>
                    <Modal.Simple
                        width={800}
                        visible={this.state.previewVisible}
                        onCancel={this.onPreviewClose}
                    >
                        <div className={cls('priview')}>
                            {
                                this.state.previewLoading ? <Spin /> : (
                                    <ReactAwesomePlayer
                                        options={{
                                            autoplay: true,
                                            preload: 'auto',
                                            sources: [{
                                                type: `video/mp4`,
                                                src: this.state.previewSrc
                                            }],
                                        }}
                                    />
                                )
                            }
                        </div>
                    </Modal.Simple>
                </Layout.Content>
            </>
        );
    }
}

export default Editor;
