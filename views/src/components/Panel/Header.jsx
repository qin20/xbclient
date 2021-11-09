import React from "react";
import classNames from "classnames";
import namespace from '../../utils/namespace';

const cls = namespace('bee-panel-header');

export default class PanelHeader extends React.PureComponent {
    render() {
        const { className, ...restProps } = this.props;
        return (
            <div className={classNames(cls(), className)} {...restProps}/>
        );
    }
};
