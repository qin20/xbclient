import React from "react";
import classNames from "classnames";
import namespace from '../../utils/namespace';

const cls = namespace('bee-panel');

export default class Panel extends React.PureComponent {
    render() {
        const { className, ...restProps } = this.props;
        return (
            <div className={classNames(cls(), className)} {...restProps} />
        );
    }
};
