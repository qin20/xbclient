import React from 'react';
import ReactAwesomePlayer from 'react-awesome-player'
import { PlusOutlined } from '@ant-design/icons';
import Cleave from 'cleave.js/react';
import { Button, Input, Spin,  Checkbox, Slider } from '../../components';
import namespace from '../../utils/namespace';

const cls = namespace('bee-cut');

export default class Clip extends React.PureComponent {
    onStartChange = (e) => {
        // e.preventDefault();
        this.props.onStartChange && this.props.onStartChange(e, this.props.data, this.props.index);
    }

    onEndChange = (e) => {
        // e.preventDefault();
        this.props.onEndChange && this.props.onEndChange(e, this.props.data, this.props.index);
    }

    onStrChange = (e) => {
        // e.preventDefault();
        this.props.onStrChange && this.props.onStrChange(e, this.props.data, this.props.index);
    }

    onAutoSoundChange = (e) => {
        // e.preventDefault();
        this.props.onAutoSoundChange && this.props.onAutoSoundChange(e, this.props.data, this.props.index);
    }

    onOriginSoundChange = (e) => {
        // e.preventDefault();
        this.props.onOriginSoundChange && this.props.onOriginSoundChange(e, this.props.data, this.props.index);
    }

    onOriginSoundVolumeChange = (value) => {
        this.props.onOriginSoundVolumeChange && this.props.onOriginSoundVolumeChange(value, this.props.data);
    }

    onClip = (e) => {
        // e.preventDefault();
        this.props.onClip && this.props.onClip(e, this.props.data, this.props.index);
    }

    deleteClip = (e) => {
        // e.preventDefault();
        this.props.deleteClip && this.props.deleteClip(e, this.props.data, this.props.index);
    }

    addClip = (e) => {
        // e.preventDefault();
        this.props.addClip && this.props.addClip(e, this.props.data, this.props.index);
    }

    render() {
        const clip = this.props.data;

        return (
            <div key={clip.id} className={cls('clip')}>
                <Spin spinning={clip.loading || false}>
                    <div className={cls('clip-video')}>
                            {
                                !!clip.src && (
                                    <ReactAwesomePlayer options={this.props.videoOptions} />
                                )
                            }
                    </div>
                </Spin>
                <div className={cls('clip-range')}>
                    <Cleave
                        className="ant-input"
                        placeholder="00:00:00.000"
                        options={{
                            numericOnly: true,
                            blocks: [2, 2, 2, 3],
                            delimiters: [':', ':', '.'],
                        }}
                        value={clip.start}
                        onChange={this.onStartChange}
                    />
                    <span style={{margin: "0 1px"}}>~</span>
                    <Cleave
                        className="ant-input"
                        placeholder="00:00:00.000"
                        options={{
                            numericOnly: true,
                            blocks: [2, 2, 2, 3],
                            delimiters: [':', ':', '.'],
                        }}
                        value={clip.end}
                        onChange={this.onEndChange}
                    />
                </div>
                <Input.TextArea
                    placeholder="请输入配音"
                    className={cls('clip-srt')}
                    value={clip.srt}
                    onChange={this.onStrChange}
                />
                <div className={cls('sound')}>
                    <Checkbox
                        checked={clip.autoSound === undefined ? true : (+clip.autoSound)}
                        onChange={this.onAutoSoundChange}
                    >配音</Checkbox>
                    <Checkbox
                        checked={!!(+clip.originSound)}
                        onChange={this.onOriginSoundChange}
                    >原声</Checkbox>
                    <Slider
                        value={clip.originSoundVolume}
                        disabled={!(+clip.originSound)}
                        className={cls('sound-volume')}
                        onChange={this.onOriginSoundVolumeChange}
                    />
                </div>
                <div className={cls('clip-buttons')}>
                    <Button long onClick={this.onClip}>剪辑</Button>
                    <Button long>设置</Button>
                    <Button long onClick={this.deleteClip} danger>删除</Button>
                </div>
                <div className={cls('add-button')}>
                    <Button type="primary" shape="circle" onClick={this.addClip}><PlusOutlined /></Button>
                </div>
            </div>
        )
    }
}
