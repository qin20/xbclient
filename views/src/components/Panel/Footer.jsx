import React from "react";
import classNames from "classnames";
import namespace from '../../utils/namespace';

const cls = namespace('bee-panel-footer');

export default class PanelFooter extends React.PureComponent {
    render() {
        const { className, ...restProps } = this.props;
        return (
            <div className={classNames(cls(), className)} {...restProps}/>
        );
    }
};
