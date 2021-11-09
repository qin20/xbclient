import React from "react";
import classnames from 'classnames';
import { Button } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-btn');

export default class Content extends React.PureComponent {
    render() {
        const {className = '', main, long, ...restProps} = this.props;

        return (
            <Button
                size="small"
                className={classnames(cls(), className, {
                    [cls('main')]: main,
                    [cls('long')]: long,
                })}
                {...restProps}
            />
        );
    }
};
