import React from "react";
import { Layout } from "antd";
import { NavLink  } from "react-router-dom";
import {
    ScissorOutlined, FolderOutlined, AppstoreOutlined,
    UserOutlined, CommentOutlined,
} from '@ant-design/icons';
import { Model, Form } from '../../components';
import namespace from '../../utils/namespace';

const cls = namespace('bee-layout-sider');

export default class Content extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            loginModelVisible: false,
        };
    }

    showModelVisible() {

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
                <div className={cls('bottom')}>
                    <div className={cls('btn')}>
                        <UserOutlined /> 未登录
                    </div>
                    <div className={cls('btn')}>
                        <CommentOutlined /> 问题反馈
                    </div>
                </div>
                <Model.Simple>
                    <Form></Form>
                </Model.Simple>
            </Layout.Sider>
        );
    }
};
