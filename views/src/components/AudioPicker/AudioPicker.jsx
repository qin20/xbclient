import React from "react";
import {SoundOutlined, ManOutlined, WomanOutlined} from '@ant-design/icons';
import {Slider, Form, Radio, Input, Tabs} from '..';
import data from './data';
import namespace from '../../utils/namespace';

import './AudioPicker.scss';
import invoke from "../../utils/invoke";

const cls = namespace('bee-audioPicker');

export default class AudioPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: data,
            audioLoading: false,
        };
        let params;
        try {
            params = JSON.parse(window.localStorage.getItem('audio_params'));
        } catch(e) {
            params = {};
        }
        this.defaultText = "大家好 我是小白 今天为大家带来一部非常精彩的影片";
        this.params = {
            text: this.defaultText,
            voice: 'xiaoyun',
            speech_rate: 200,
            pitch_rate: 0,
            volume: 80,
            ...params,
            ...props.value,
        };
        this.audio = new Audio();
    }

    componentDidMount() {
        this.fireChange();
    }

    onTryAudio = async () => {
        this.audio.pause();
        window.localStorage.setItem('audio_params', JSON.stringify(this.params));
        try {
            this.setState({ audioLoading: true });
            const src = await invoke('get:/try-audio', this.params);
            this.setState({ audioLoading: false });
            this.audio.src = `${src}?t=${Date.now()}`;
            this.audio.play();
        } catch(e) {
            this.setState({ audioLoading: false });
        }
    }

    onInputChange = (e) => {
        this.params.text = e.target.value;
        this.fireChange();
    }

    onInputBlur = (e) => {
        if (!e.target.value) {
            this.params.text = this.defaultText;
            this.fireChange();
        }
    }

    onRadioChange = (e) => {
        this.params = {
            ...this.params,
            ...this.getVoice(e.target.value),
        };
        this.fireChange();
    }

    onSpeedChange = (value) => {
        this.params.speech_rate = value;
        this.fireChange();
    }

    onPitchChange = (value) => {
        this.params.pitch_rate = value;
        this.fireChange();
    }

    onVolumeChange = (value) => {
        this.params.volume = value;
        this.fireChange();
    }

    fireChange() {
        const { text, ...params } = this.params;
        this.props.onChange && this.props.onChange(params);
    }

    getVoice(voice) {
        for (let type in this.state.data) {
            const voices = this.state.data[type];
            for (let i = 0; i < voices.length; i++) {
                const v = voices[i];
                if (v.voice === voice) {
                    return v;
                }
            }
        }
    }

    render() {
        return (
            <div className={cls()}>
                <Form.Item label="配音试听">
                    <Input.Search
                        defaultValue={this.params.text}
                        placeholder={this.defaultText}
                        onBlur={this.onInputBlur}
                        onChange={this.onInputChange}
                        enterButton={(
                            <span className={cls('try-audio')}>
                                {!this.state.audioLoading && <SoundOutlined />}
                                试听
                            </span>
                        )}
                        onSearch={this.onTryAudio}
                        loading={this.state.audioLoading}
                    />
                </Form.Item>
                <Form.Item label="语速" className={cls('inline-item')}>
                    <Slider
                        min={-500}
                        max={500}
                        defaultValue={this.params.speech_rate}
                        tooltipVisible
                        onChange={this.onSpeedChange}
                    />
                </Form.Item>
                <Form.Item label="语调" className={cls('inline-item')}>
                    <Slider
                        min={-500}
                        max={500}
                        defaultValue={this.params.pitch_rate}
                        tooltipVisible
                        onChange={this.onPitchChange}
                    />
                </Form.Item>
                <Form.Item label="音量" className={cls('inline-item')}>
                    <Slider
                        defaultValue={this.params.volume}
                        tooltipVisible
                        onChange={this.onVolumeChange}
                    />
                </Form.Item>
                <div className="clearfix"></div>
                <Form.Item label="配音人声">
                    <Radio.Group className={cls('radios')} defaultValue={this.params.voice} onChange={this.onRadioChange}>
                        <Tabs defaultActiveKey={this.getVoice(this.params.voice).type} type="card" size="small">
                            {
                                Object.keys(this.state.data).sort((a, b) => {
                                    const order = ['方言场景', '童声场景', '直播场景'];
                                    return order.indexOf(b) - order.indexOf(a);
                                }).map((type) => {
                                    const data = this.state.data[type];
                                    return (
                                        <Tabs.TabPane tab={type} key={type} className={cls('sounds')}>
                                            {
                                                data.map((d) => {
                                                    return (
                                                        <span key={d.voice}>
                                                            <Radio value={d.voice}>
                                                                {
                                                                    d.sex === '男'
                                                                        ? <ManOutlined className={cls('boy')} />
                                                                        : <WomanOutlined className={cls('girl')} />
                                                                }
                                                                {d.nickname}
                                                                <span>（{d.desc}）</span>
                                                            </Radio>
                                                        </span>
                                                    );
                                                })
                                            }
                                        </Tabs.TabPane>
                                    )
                                })
                            }
                        </Tabs>
                    </Radio.Group>
                </Form.Item>
            </div>
        );
    }
}
