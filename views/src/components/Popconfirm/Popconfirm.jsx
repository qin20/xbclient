import React from "react";
import classNames from 'classnames';
import { Popconfirm } from 'antd';
import namespace from '../../utils/namespace';

const cls = namespace('bee-popconfirm');

export default class BeePopconfirm extends React.Component {
    render() {
        const { className = '', ...restProps } = this.props;

        return (
            <Popconfirm
                okButtonProps={{ className: 'bee-btn' }}
                cancelButtonProps={{ className: 'bee-btn' }}
                okText="确定"
                cancelText="取消"
                overlayClassName={classNames(cls(), className)}
                {...restProps}
            />
        );
    }
}
