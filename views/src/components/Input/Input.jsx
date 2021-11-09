import React from "react";
import { Input } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-input');

export default class BeeInput extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Input className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
