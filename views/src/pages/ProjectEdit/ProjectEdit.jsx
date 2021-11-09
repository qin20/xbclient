import React from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {Button, Layout, Panel, Space} from '../../components';
import ProjectForm from '../../components/ProjectForm';
import invoke from '../../utils/invoke';

export default class ProjectEdit extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            project: null,
        };
        this.projForm = React.createRef();
    }

    async componentDidMount() {
        const project = await invoke('get:/projects', this.props.match.params.id);
        this.setState({ project });
    }

    submiting = async () => {
        const values = await this.projForm.current.getValues();
        await invoke('put:/projects', {
            id: this.props.match.params.id,
            ...values,
        });
        this.goback();
    }

    goback = () => {
        this.props.history.goBack();
    }

    render() {
        if (!this.state.project) {
            return null;
        }

        return (
            <Layout.Content style={{ display: 'flex' }}>
                <Panel style={{ width: '100%' }}>
                    <Panel.Header style={{ justifyContent: 'space-between' }}>
                        <span>编辑</span>
                        <Space
                            direction="horizontal"
                            align="center"
                            style={{ float: 'right' }}
                        >
                            <Button
                                htmlType="submit"
                                onClick={this.goback}
                            >
                                <CloseOutlined /> 取消
                            </Button>
                            <Button
                                htmlType="submit"
                                onClick={this.submiting}
                                main
                            >
                                <CheckOutlined /> 应用
                            </Button>
                        </Space>
                    </Panel.Header>
                    <Panel.Content>
                        <ProjectForm ref={this.projForm} initialValues={this.state.project} />
                    </Panel.Content>
                </Panel>
            </Layout.Content>
        );
    }
}