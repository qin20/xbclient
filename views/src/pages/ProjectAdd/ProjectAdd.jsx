import React from 'react';
import invoke from '../../utils/invoke';
import {Panel, Layout, Button, Space} from '../../components';
import ProjectForm from '../../components/ProjectForm';

export default class ProjectAdd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            submiting: false,
        };
        this.projForm = React.createRef();
    }

    goback = () => {
        this.props.history.goBack();
    }

    submiting = async () => {
        const values = await this.projForm.current.getValues();
        try {
            await invoke('post:/projects', values);
            this.goback();
        } catch (e) {}
    }

    render() {
        return (
            <Layout.Content>
                <Panel>
                    <Panel.Header style={{ justifyContent: 'space-between' }}>
                        <span>新增</span>
                        <Space
                            direction="horizontal"
                            align="center"
                            style={{ float: 'right', marginTop: -1 }}
                        >
                            <Button
                                htmlType="submit"
                                onClick={this.goback}
                            >取消</Button>
                            <Button
                                htmlType="submit"
                                onClick={this.submiting}
                                main
                            >保存</Button>
                        </Space>
                    </Panel.Header>
                    <Panel.Content>
                        <ProjectForm ref={this.projForm} />
                    </Panel.Content>
                </Panel>
            </Layout.Content>
        );
    }
}