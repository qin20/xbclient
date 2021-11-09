import React from "react";
import { Divider } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-divider');

export default class BeeDivider extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Divider className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
