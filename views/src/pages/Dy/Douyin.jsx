import React from 'react';
import { Link } from 'react-router-dom';
import Cleave from 'cleave.js/react';
import { Breadcrumb, Form, Input, Button, notification } from 'antd';
import { Page } from '../../components';
import namespace from '../../utils/namespace';
import './Douyin.scss';
import axios from 'axios';

const cls = namespace('bee-dy');

export default class Douyin extends React.Component {
    constructor(props) {
        super(props);
        this.sourceRef = React.createRef();
        this.outputRef = React.createRef();
        let params = {};
        try {
            if (localStorage.getItem('dy-clips')) {
                params = JSON.parse(localStorage.getItem('dy-clips'));
            }
        } catch (e) {}
        this.params = params;
        this.state = {
            loading: false,
            clips: this.params.clips || [{}],
        };
    }

    addClip = () => {
        const clips = this.state.clips;
        clips.push({});
        this.setState({ clips });
    }

    export = () => {
        this.setState({ loading: true });
        const params = {
            output: this.outputRef.current.input.value,
            source: this.sourceRef.current.input.value,
            clips: this.state.clips,
        };
        localStorage.setItem('dy-clips', JSON.stringify(params));
        axios.get('/v1/dy-clip', {
            params,
        }).then(() => {
            const args = {
                message: '切割成功！',
                duration: 0,
            };
            notification.success(args);
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    onStartChange = (e) => {
        const index = e.target.dataset.index;
        const clips = this.state.clips;
        clips[index].start = e.target.value;
        this.setState({ clips });
    }

    onEndChange = (e) => {
        const index = e.target.dataset.index;
        const clips = this.state.clips;
        clips[index].end = e.target.value;
        this.setState({ clips });
    }

    render() {
        return (
            <Page
                title={(
                    <Breadcrumb>
                        <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>视频分段</Breadcrumb.Item>
                    </Breadcrumb>
                )}
                buttons={(
                    <>
                        <Button
                            loading={this.state.loading}
                            type="primary"
                            htmlType="submit"
                            onClick={this.export}
                        >
                            切割
                        </Button>
                    </>
                )}
            >
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
                    <Form.Item label="影片路径">
                        <div className="">
                            <Input ref={this.sourceRef} defaultValue={this.params.source}></Input>
                            {
                                this.state.clips.map((clip, i) => {
                                    return (
                                        <div key={i} className={cls('clip-range')}>
                                            <Cleave
                                                className="ant-input"
                                                placeholder="00:00:00.000"
                                                options={{
                                                    numericOnly: true,
                                                    blocks: [2, 2, 2, 3],
                                                    delimiters: [':', ':', '.'],
                                                }}
                                                value={clip.start}
                                                data-index={i}
                                                onChange={this.onStartChange}
                                            />
                                            <span style={{margin: "0 3px"}}>~</span>
                                            <Cleave
                                                className="ant-input"
                                                placeholder="00:00:00.000"
                                                options={{
                                                    numericOnly: true,
                                                    blocks: [2, 2, 2, 3],
                                                    delimiters: [':', ':', '.'],
                                                }}
                                                value={clip.end}
                                                data-index={i}
                                                onChange={this.onEndChange}
                                            />
                                        </div>
                                    );
                                })
                            }
                            <Button onClick={this.addClip}>添加片段</Button>
                        </div>
                    </Form.Item>
                    <Form.Item label="保存文件夹路径">
                        <Input ref={this.outputRef} defaultValue={this.params.output}></Input>
                    </Form.Item>
                </Form>
            </Page>
        );
    }
}