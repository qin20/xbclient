import React from "react";
import { Tabs } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-tabs');

export default class BeeTabs extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Tabs className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
