import React from "react";
import { Modal } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-modal');

export default class BeeModal extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <Modal className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
