import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Popconfirm, Space, Typography, Divider } from '../../components';
import { PlusCircleFilled, DeleteOutlined } from '@ant-design/icons';
import namespace from '../../utils/namespace';
import invoke from "../../utils/invoke";

import './Dashboard.scss';

const cls = namespace('bee-dashboard');

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
        };
    }

    async deleteProject(project, index) {
        await invoke('delete:/projects', project);
        this.setState(({ projects }) => {
            const prjectsCopy = [...projects];
            prjectsCopy.splice(index, 1);
            return { projects: prjectsCopy };
        });
    }


    start = async () => {
        const project = await invoke('post:/projects');
        this.props.history.push(`/projects/edit/${project.id}`);
    }

    syncProjectIntra(project) {
        setTimeout(() => {
            invoke(`get:/projects`, {
                params: {
                    project: project,
                }
            }).then(({data}) => {
                if (+data.intra_percentage < 100 ) {
                    this.syncProjectIntra(project);
                }
                this.setState(({ projects }) => {
                    for (let i = 0; i < projects.length; i++) {
                        const pro = projects[i];
                        if (pro.name === data.name) {
                            pro.intra_percentage = +data.intra_percentage;
                            pro.intra = data.intra;
                        }
                    }
                    return { projects };
                });
            });
        }, 1000);
    }

    onDecode = (project) => {
        invoke.invoking('get:/projects/decode', project, (data) => {
            this.setState(({ projects }) => {
                for (let i = 0; i < projects.length; i++) {
                    const pro = projects[i];
                    if (pro.name === project.name) {
                        pro.decodeProgress = data.decodeProgress;
                        pro.source = data.source;
                    }
                }
                return { projects };
            });
        });
    }

    async componentDidMount() {
        const projects = await invoke('get:/projects');
        this.setState({ projects: projects });
    }

    render() {
        return (
            <Layout.Content className={cls()}>
                <div className={cls('start')} onClick={this.start}>
                    <PlusCircleFilled /> 开始创作
                </div>
                <div className={cls('list-title')}>我的剪辑（{this.state.projects.length}）</div>
                <div className={cls('projects')}>
                    {
                        this.state.projects.map((p, i) => {
                            const poster = `${(p.poster || '').replace(/\\/g, '/')}?_=${new Date(p.updateTime).getTime()}`;
                            return (
                                <div className={cls('project')} key={p.id}>
                                    <div className={cls('project-poster-container')}>
                                        {
                                            p.source && +p.decodeProgress === 100 ? (
                                                <Link to={`/projects/${p.id}`}>
                                                    <div
                                                        className={cls('project-poster')}
                                                        style={{ backgroundImage: `url(${poster})`}}
                                                    />
                                                </Link>
                                            ) : (
                                                <>
                                                    <div className={cls('project-poster-mask')}
                                                        style={{
                                                            height: `${100 - (+p.decodeProgress || 0)}%`,
                                                        }}
                                                    />
                                                    <div
                                                        className={cls('project-poster')}
                                                        style={{
                                                            backgroundImage: `url(${poster})`,
                                                        }}
                                                    />
                                                </>
                                            )
                                        }
                                        <Popconfirm
                                            title="删除后不可恢复！"
                                            onConfirm={() => this.deleteProject(p, i)}
                                            placement="bottomLeft"
                                            align={{ offset: [-8, 0] }}
                                        >
                                            <DeleteOutlined className={cls('project-delete')} />
                                        </Popconfirm>
                                    </div>
                                    <p className={cls('project-name')}>{p.name}</p>
                                    {
                                        p.source && +p.decodeProgress === 100 ? (
                                            <p className={cls('project-meta')}>{`${p.clips.length}片段`} | {`${p.duration}`}</p>
                                        ) : (
                                            <Space size={0} split={<Divider type="vertical" />}>
                                                <Link to={`/projects/edit/${p.id}`}>编辑</Link>
                                                { p._source ? <Typography.Link onClick={() => this.onDecode(p)}>解码</Typography.Link> : null}
                                            </Space>
                                        )
                                    }
                                </div>
                            );
                        })
                    }
                </div>
            </Layout.Content>
        )
    }
}