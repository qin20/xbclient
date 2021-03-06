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
        const {data} = await invoke('get:/projects', this.props.match.params.id);
        const clips = data.clips && data.clips.length ? data.clips : [this.getNewClip()];
        this.setState({ project: data, clips });
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
            this.save();
        });
    }

    formatTime(time) {
        window.moment = moment;
        return moment(time, 'HH:mm:ss.SSS').format('HH:mm:ss.SSS')
    }

    onClip = (e, params) => {
        if (!this.state.project.source) {
            message.error('??????????????????');
            return;
        }
        this.clip({
            ...params,
            source: this.state.project.source,
        });
    };

    clip = async (params) => {
        params.start = this.formatTime(params.start);
        params.end = params.end && this.formatTime(params.end);

        if (!params.end && !(params.srt && (params.autoSound === undefined ? true : +params.autoSound))) {
            message.error('???????????????????????????????????????');
            return;
        }

        this.updateClip(params.id, {
            loading: true,
        }, false);

        try {
            const {data} = await invoke('post:/projects/clip', {
                clip: {
                    ...params,
                    srt: (params.srt || '').trim(),
                },
                project: this.state.project,
            });

            this.updateClip(params.id, {
                ...data,
                loading: false,
                poster: `${data.poster.replace(/\\/g, '/')}?_=${Date.now()}`,
                src: `${data.src.replace(/\\/g, '/')}?_=${Date.now()}`
            });
        } catch (e) {
            this.updateClip(params.id, {
                loading: false,
            }, false);
        }
    }

    clipAll = () => {
        confirm('????????????????????????????????????????????????????????????????????????').then(() => {
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
            const clips = [...this.state.clips];
            clips.splice(index, 1);
            this.updateClips(clips);
            invoke('delete:/projects/clip', {
                project: this.state.project,
                clip: data,
            });
        };
        if (data.src) {
            confirm('???????????????????????????????????????????????????').then(doDelete);
        } else {
            doDelete();
        }
    }

    save = () => {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(async () => {
            this._save();
        }, 10000);
    }

    async saveRightNow() {
        clearTimeout(this.saveTimeout);
        await this._save();
    }

    async _save() {
        this.setState({ saving: true });
        const { data } = await invoke('put:/projects', {
            ...this.state.project,
            clips: this.state.clips,
        });
        this.setState({ project: data, saving: false });
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
        if (!clips || clips.length === 0) {
            clips = [this.getNewClip()];
        }
        this.setState({ clips }, () => {
            callback && callback();
            save && this.save();
        });
    }

    previewVedio = async () => {
        this.setState({ previewLoading: true, previewSrc: '', previewVisible: true });
        await this.saveRightNow();
        const {data} = await invoke('get:/projects/preview', this.state.project);
        this.setState({ previewLoading: false, previewSrc: data });
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
                            <LoadingOutlined /> ????????? ...
                            <span>({this.state.clips.length - loadingCount}/{this.state.clips.length})</span>
                        </span>
                    ) : (
                        <span className={cls('saved')}>
                            <CheckCircleFilled />
                            {this.state.project.updateTime ? this.state.project.updateTime.split(/\s+/)[1] : '' }
                            <span> ???????????????</span>
                        </span>
                    )}
                    <span className={cls('name')}>{this.state.project && this.state.project.name}</span>
                    <span className={cls('buttons')}>
                        <Button type="primary" onClick={this.showExportVideo}>
                            <ExportOutlined />??????
                        </Button>
                        <Modal.Panel
                            title="??????"
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
                                        <p>16:9????????????</p>
                                    </div>
                                    <div onClick={this.setDouyinRatio}>
                                        <div className={cls('export-ratio-9-16')}></div>
                                        <p>9:16????????????</p>
                                    </div>
                                </div>
                            </div>
                        </Modal.Panel>
                    </span>
                </Layout.Header>
                <Layout.Content className={cls('content')}>
                    <div className={cls('col-3')}>
                        <Panel className={cls('player')}>
                            <Panel.Header>?????????</Panel.Header>
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
                                                <PlusCircleFilled /> ????????????
                                            </div>
                                        </div>
                                    )
                                }
                            </Panel.Content>
                        </Panel>
                        <Panel className={cls('settings')}>
                            <Panel.Header>??????</Panel.Header>
                            <Panel.Content className={cls('project-info')}>
                                <div><span>???????????????</span><span>{this.state.project.name}</span></div>
                                <div><span>???????????????</span><span>{this.state.project.source}</span></div>
                                <div>
                                    <span>???????????????</span>
                                    <span>
                                        {
                                            this.state.project.voice.sex === '???'
                                                ? <ManOutlined className={cls('boy')} />
                                                : <WomanOutlined className={cls('girl')} />
                                        }
                                        {this.state.project.voice.nickname}
                                        <span>???{this.state.project.voice.desc}???</span>
                                    </span>
                                </div>
                                <div><span>???????????????</span><span>{this.state.project.createTime}</span></div>
                            </Panel.Content>
                            <Panel.Footer style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button type="" onClick={this.clipAll} loading={loadingCount} long>
                                        ??????
                                        {
                                            !!loadingCount && (
                                                <span>({this.state.clips.length - loadingCount}/{this.state.clips.length})</span>
                                            )
                                        }
                                    </Button>
                                    <Link to={`/projects/edit/${this.state.project.id}`}>
                                        <Button long>??????</Button>
                                    </Link>
                                </Space>
                            </Panel.Footer>
                        </Panel>
                    </div>
                    <Panel className={cls('clips-panel')}>
                        <Panel.Header style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className={cls('info')}>
                                <div>??????: {this.state.clips.length}???</div>
                                <div>?????????: {this.state.project.duration}</div>
                            </div>
                            <Space>
                                <Button onClick={this.previewVedio} long>
                                    <PlaySquareOutlined /> ??????
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
