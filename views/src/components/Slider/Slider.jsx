import React from "react";
import { Slider } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-slider');

export default class BeeSlider extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Slider className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
