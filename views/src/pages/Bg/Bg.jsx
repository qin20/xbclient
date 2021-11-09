import React from 'react';
import {Link} from 'react-router-dom';
import ReactAwesomePlayer from 'react-awesome-player'
import {Breadcrumb, Button, Form, Slider, notification} from 'antd';
import axios from '../../axios';
import Page from '../../components/Page';
import namespace from '../../utils/namespace';
import './Bg.scss';

const cls = namespace('bee-bg');

export default class Bg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adding: false,
            addPercentage: 0,
            audioPlaying: false,
            project: {},
        };
        this.defaultVolume = 5;
        this.audio = new Audio();
        this.audio.volume = this.defaultVolume / 100;
        this.audio.preload = 'metadata';
        this.options = {
            poster: '',
            preload: 'none',
            sources: [{
                type: `video/mp4`,
                src: `/v1/${1}`,
            }],
        };
    }

    componentDidMount() {
        axios.get('/project', { params: { project: this.props.match.params.project }}).then(({ data }) => {
            this.audio.src = `/v1/${data.bg_r}?t=${Date.now()}`;
            this.options = {
                poster: `/v1/${data.clips[0].poster}?t=${Date.now()}`,
                preload: 'none',
                sources: [{
                    type: `video/mp4`,
                    src: `/v1/${data.output_r}?t=${Date.now()}`,
                }],
            };
            this.setState({ project: data });
        });
    }

    componentWillUnmount() {
        this.audio.pause();
        this.audio.src = '';
        this.audio = null;
    }

    syncProjectIntra(project) {
        setTimeout(() => {
            axios.get('/project', {
                params: {
                    project: this.props.match.params.project,
                }
            }).then(({data}) => {
                this.setState({ addPercentage: data.bg_percentage });
                if (+data.bg_percentage < 100 ) {
                    this.syncProjectIntra(project);
                }
            });
        }, 1000);
    }

    addBg = (e) => {
        e.preventDefault();
        this.setState({ adding: true });
        axios.get('/merge_bg', {
            params: {
                volume: this.audio.volume * 100,
                project: this.props.match.params.project,
            },
        }).then(({data}) => {
            const args = {
                message: '背景音乐已合成！',
                description: `${data.src}`,
                duration: 0,
            };
            notification.success(args);
            this.setState({ adding: false });
        }).finally(() => {
            this.setState({ adding: false });
        });
        this.syncProjectIntra();
    }

    toggleAudio = () => {
        this.setState({ audioPlaying: !this.state.audioPlaying }, () => {
            if (this.state.audioPlaying) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        });
    }

    onVolumeChange = (value) => {
        this.audio.volume = value / 100;
    }

    render() {
        return (
            <Page
                title={(
                    <>
                        <Breadcrumb>
                            <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
                            <Breadcrumb.Item>添加背影音乐</Breadcrumb.Item>
                        </Breadcrumb>
                    </>
                )}
                buttons={(
                    <>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={this.state.adding}
                            onClick={this.addBg}
                        >
                            开始合成
                            {this.state.adding ? `（${this.state.addPercentage}%）` : null}
                        </Button>
                    </>
                )}
            >
                <div className={cls('video')}>
                    <ReactAwesomePlayer options={this.options} />
                </div>
                <Form
                    ref={this.form}
                    className={cls('form')}
                    name="basic"
                    labelCol={{
                        span: 2,
                    }}
                    initialValues={{
                        bgVolume: this.defaultVolume
                    }}
                    wrapperCol={{
                        span: 22,
                    }}
                    onFinish={this.onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        label="背景音乐"
                        name="bg"
                    >
                        <div>
                            <Button onClick={this.toggleAudio}>{this.state.audioPlaying ? '暂停' : '播放'}</Button>
                            <span style={{ marginLeft: 10 }}>{this.state.project.bg}</span>
                        </div>
                    </Form.Item>
                    <Form.Item
                        label="背景音乐"
                        name="bgVolume"
                    >
                        <Slider onChange={this.onVolumeChange} />
                    </Form.Item>
                </Form>
            </Page>
        );
    }
}
