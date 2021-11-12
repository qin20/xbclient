import React from "react";
import { Spin } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-spin');

export default class BeeSpin extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Spin className={`${cls()} ${className}`} {...restProps} />
        );
    }
}
