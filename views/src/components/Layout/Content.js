import React from "react";
import { Layout } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-layout-content');

export default class Content extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Layout.Content className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
