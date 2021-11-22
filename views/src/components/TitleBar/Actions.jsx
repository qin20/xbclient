import React from "react";
import classnames from "classnames";
import namespace from '../../utils/namespace';

const cls = namespace('bee-titlebar');

export default class Actions extends React.PureComponent {
    render() {
        const { className, ...restProps } = this.props;
        return (
            <div className={classnames(cls('actions'), className)} {...restProps} />
        )
    }
}
