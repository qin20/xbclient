import React from "react";
import { Layout } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-layout-header');

export default class Header extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Layout.Header className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
