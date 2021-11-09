import React from "react";
import { Radio } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-radio');

export default class BeeRadio extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Radio className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
