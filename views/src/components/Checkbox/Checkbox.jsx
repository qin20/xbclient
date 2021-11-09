import React from "react";
import { Checkbox } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-checkbox');

export default class BeeCheckbox extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Checkbox className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
