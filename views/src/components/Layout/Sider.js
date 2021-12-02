import React from "react";
import { Layout } from "antd";
import { NavLink  } from "react-router-dom";
import {
    ScissorOutlined, FolderOutlined, AppstoreOutlined,
    UserOutlined, CommentOutlined
} from '@ant-design/icons';
import { ModalLogin, Button, message } from "..";
import namespace from '../../utils/namespace';
import { connect, dispatch } from "../../store";
import { confirm } from "../../utils/modal";
import axios from '../../axios';

const cls = namespace('bee-layout-sider');

class Sider extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            pointsFree: [],
        };
    }

    logout = async () => {
        await confirm('确认注销吗?');
        try {
            await axios.post('/logout');
            this.setState({ pointsFree: [] });
            dispatch({ type: 'LOGOUT' });
        } catch(e) {}
    }

    today = async () => {
        try {
            const { data } = await axios.post('/account/today');
            this.setState({ pointsFree: [data.pointsFree - this.props.user.pointsFree] });
            dispatch({ type: 'TODAY', data });
        } catch(e) {
            message.warn(e.message || '签到失败');
        }
    }

    render() {
        return (
            <Layout.Sider className={cls()}>
                <div className={cls('logo')}>
                    <div className={cls('title')}><ScissorOutlined /> 小白剪辑</div>
                    <div className={cls('slogen')}>天道酬勤，厚德载物</div>
                </div>
                <div className={cls('menu')}>
                    <NavLink className={cls('menu-item')} to="/projects" activeClassName={cls('menu-item-active')}>
                        <FolderOutlined /> 本地项目
                    </NavLink>
                    <NavLink  className={cls('menu-item')} to="/poster-clip" exact activeClassName={cls('menu-item-active')}>
                        <AppstoreOutlined /> 宫格图片
                    </NavLink>
                    <NavLink  className={cls('menu-item')} to="/dy" exact activeClassName={cls('menu-item-active')}>
                        <ScissorOutlined /> 视频分段
                    </NavLink>
                </div>
                <div className={cls('feeback')}>
                    {
                        this.props.user
                            ? (
                                <div className={cls('userinfo')}>
                                    <div>
                                        <span>用户：{this.props.user.phone}</span>
                                    </div>
                                    <div className={cls('points')}>
                                        <span>点数：{(this.props.user.pointsFree + this.props.user.pointsPay) || 0} </span>
                                    </div>
                                    <div className={cls('actions')}>
                                        {
                                            this.props.user.today
                                                ? (
                                                    <Button className={cls('today')}>
                                                        <span>已签到</span>
                                                        {
                                                            this.state.pointsFree.map((p) => (
                                                                <div className={cls('addpoints')} key={p}>{`+ ${p}`}</div>
                                                            ))
                                                        }
                                                    </Button>
                                                ) : (
                                                    <Button main className={cls('today')} onClick={this.today}>
                                                        <span>签到</span>
                                                        {
                                                            this.state.pointsFree.map((p) => (
                                                                <div className={cls('addpoints')} key={p}>{`+ ${p}`}</div>
                                                            ))
                                                        }
                                                    </Button>
                                                )
                                        }
                                        <Button className={cls('logout')} onClick={this.logout}>注销</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className={cls('btn')} onClick={() => dispatch({ type: 'SHOW_LOGIN_MODEL' })}>
                                    <UserOutlined /> 未登录
                                </div>
                            )
                    }
                    <div className={cls('btn')}>
                        <CommentOutlined /> 问题反馈
                    </div>
                </div>
                <ModalLogin />
            </Layout.Sider>
        );
    }
};

const mapStateToProps = ({ user }) => ({ user });
export default connect(mapStateToProps, Sider);
