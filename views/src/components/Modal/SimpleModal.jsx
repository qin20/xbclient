import React from "react";
import Modal from './Modal';
import namespace from '../../utils/namespace';

const cls = namespace('bee-modal-simple');

export default class SimpleModal extends React.PureComponent {
    render() {
        const {className = '', wrapClassName, ...restProps} = this.props;
        return (
            <Modal
                wrapClassName={`${cls('wrapper')} ${wrapClassName}`}
                className={`${cls()} ${className}`}
                destroyOnClose={true}
                focusTriggerAfterClose={false}
                maskClosable={true}
                {...restProps}
                title={null}
                footer={null}
            />
        );
    }
};
