import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Popconfirm, TitleBar } from '../../components';
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
        // const { data } = await invoke('post:/projects');
        this.props.history.push(`/projects/add`);
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
        const { data } = await invoke('get:/projects');
        this.setState({ projects: data });
    }

    render() {
        return (
            <Layout.Content className={cls()}>
                <TitleBar className={cls('titlebar')} maximizable={false}></TitleBar>
                <div className={cls('start')} onClick={this.start}>
                    <PlusCircleFilled /> ????????????
                </div>
                <div className={cls('list-title')}>???????????????{this.state.projects.length}???</div>
                <div className={cls('projects')}>
                    {
                        this.state.projects.map((p, i) => {
                            const poster = `${(p.poster || '').replace(/\\/g, '/')}?_=${new Date(p.updateTime).getTime()}`;
                            return (
                                <div className={cls('project')} key={p.id}>
                                    <div className={cls('project-poster-container')}>
                                        <Link to={`/projects/${p.id}`}>
                                            <div
                                                className={cls('project-poster')}
                                                style={{ backgroundImage: `url(${poster})`}}
                                            />
                                        </Link>
                                        {/* {
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
                                        } */}
                                        <Popconfirm
                                            title="????????????????????????"
                                            onConfirm={() => this.deleteProject(p, i)}
                                            placement="bottomLeft"
                                            align={{ offset: [-8, 0] }}
                                        >
                                            <DeleteOutlined className={cls('project-delete')} />
                                        </Popconfirm>
                                    </div>
                                    <p className={cls('project-name')}>{p.name}</p>
                                    <p className={cls('project-meta')}>{`${p.clips.length}??????`} | {`${p.duration}`}</p>
                                    {/* {
                                        p.source && +p.decodeProgress === 100 ? (
                                            <p className={cls('project-meta')}>{`${p.clips.length}??????`} | {`${p.duration}`}</p>
                                        ) : (
                                            <Space size={0} split={<Divider type="vertical" />}>
                                                <Link to={`/projects/edit/${p.id}`}>??????</Link>
                                                { p._source ? <Typography.Link onClick={() => this.onDecode(p)}>??????</Typography.Link> : null}
                                            </Space>
                                        )
                                    } */}
                                </div>
                            );
                        })
                    }
                </div>
            </Layout.Content>
        )
    }
}