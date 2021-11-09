import React from 'react';
import invoke from '../../utils/invoke';
import {Panel, Layout, Button} from '../../components';
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

    submiting = () => {
        this.projForm.current.getValues().then(async (values) => {
            this.setState({ submiting: true });
            try {
                await invoke('post:/projects', values);
                this.props.history.goBack();
            } catch(e) {
                this.setState({ submiting: false });
            }
        });
    }

    render() {
        return (
            <Layout.Content>
                <Panel>
                    <Panel.Header style={{ justifyContent: 'space-between' }}>
                        <span>新增</span>
                        <Button
                            htmlType="submit"
                            loading={this.state.submiting}
                            onClick={this.submiting}
                            main
                            style={{ float: 'right' }}
                        >
                            保存
                        </Button>
                    </Panel.Header>
                    <Panel.Content>
                        <ProjectForm ref={this.projForm} />
                    </Panel.Content>
                </Panel>
            </Layout.Content>
        );
    }
}