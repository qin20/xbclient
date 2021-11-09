import React from 'react';
import { AudioPicker, Form, Input, FilePicker } from '..';
import namespace from '../../utils/namespace';
import './ProjectForm.scss';

const cls = namespace('bee-project-form');

export default class ProjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submiting: false,
            _source: this.props.initialValues._source,
        }
        this.form = React.createRef();
    }

    async getValues() {
        const values = await this.form.current.validateFields();
        return {
            ...values,
            _source: this.state._source,
        };
    }

    onSourceChange = (e) => {
        const file = e.target.files[0];
        const _source = file ? file.path : null;
        this.setState({ _source });
    }

    render() {
        return (
            <Form
                ref={this.form}
                className={cls()}
                name="basic"
                initialValues={this.props.initialValues}
                onFinish={this.onFinish}
                autoComplete="off"
            >
                <Form.Item label="项目名称" name="name">
                    <Input placeholder="请输入名称" disabled={this.props.disableFields.indexOf('name') >= 0} />
                </Form.Item>
                <Form.Item label="选择影片" name="_source">
                    <FilePicker onChange={this.onSourceChange} />
                    <Input placeholder="请选择影片" value={this.state._source} />
                </Form.Item>
                <Form.Item label="保存路径" name="output">
                    <Input placeholder="请输入保存路径" />
                </Form.Item>
                <Form.Item name="voice">
                    <AudioPicker />
                </Form.Item>
            </Form>
        );
    }
}

ProjectForm.defaultProps = {
    initialValues: null,
    disableFields: [],
};
