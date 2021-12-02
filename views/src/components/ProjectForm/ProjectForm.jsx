import React from 'react';
import { AudioPicker, Form, Input, FilePicker } from '..';
import namespace from '../../utils/namespace';
import './ProjectForm.scss';

const cls = namespace('bee-project-form');

export default class ProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.form = React.createRef();
    }

    async getValues() {
        const values = await this.form.current.validateFields();
        return {
            ...values,
        };
    }

    onSourceChange = (e) => {
        const file = e.target.files[0];
        const source = file ? file.path : null;
        this.form.current.setFieldsValue({ source });
    }

    onBgMusicChange = (e) => {
        const file = e.target.files[0];
        const bgMusic = file ? file.path : null;
        this.form.current.setFieldsValue({ bgMusic });
    }

    render() {
        return (
            <Form
                ref={this.form}
                className={cls()}
                initialValues={this.props.initialValues}
                onFinish={this.onFinish}
                autoComplete="off"
            >
                <Form.Item label="项目名称" name="name">
                    <Input placeholder="请输入名称" disabled={this.props.disableFields.indexOf('name') >= 0} />
                </Form.Item>
                {/* <Form.Item label="AppKey" name="AppKey">
                    <Input placeholder="AppKey" />
                </Form.Item>
                <Form.Item label="AppToken" name="AppToken">
                    <Input placeholder="请输入AppToken" />
                </Form.Item> */}
                <Form.Item label="影片路径">
                    <FilePicker onChange={this.onSourceChange} />
                    <Form.Item name="source" style={{ margin: 0 }}>
                        <Input placeholder="请选择影片" />
                    </Form.Item>
                </Form.Item>
                {/* <Form.Item label="保存路径" name="output">
                    <Input placeholder="请输入保存路径" />
                </Form.Item> */}
                {/* <Form.Item label="背景音乐">
                    <FilePicker onChange={this.onBgMusicChange} />
                    <Form.Item name="bgMusic" style={{ margin: 0 }}>
                        <Input placeholder="请选择背景音乐" />
                    </Form.Item>
                </Form.Item> */}
                <Form.Item name="voice">
                    <AudioPicker />
                </Form.Item>
            </Form>
        );
    }
}

ProjectForm.defaultProps = {
    initialValues: {},
    disableFields: [],
};
