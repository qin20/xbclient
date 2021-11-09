import React from "react";
import classnames from 'classnames';
import { Layout as AntdLayout } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-layout');

export default class Layout extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <AntdLayout className={classnames(cls(), className)} {...restProps} />
        );
    }
};
