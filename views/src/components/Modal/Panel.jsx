import React from "react";
import Modal from './Modal';
import namespace from '../../utils/namespace';
import { Button } from "../../components";

const cls = namespace('bee-modal-panel');

export default class PanelModal extends React.PureComponent {
    render() {
        const {className = '', wrapClassName, ...restProps} = this.props;
        return (
            <Modal
                closable={false}
                wrapClassName={`${cls('wrapper')} ${wrapClassName}`}
                className={`${cls()} ${className}`}
                destroyOnClose={true}
                focusTriggerAfterClose={false}
                maskClosable={true}
                footer={(
                    <>
                        <Button long main {...this.props.okButtonProps} onClick={this.props.onOk}>
                            {`确定` || this.props.okText}
                        </Button>
                        <Button long {...this.props.cancelButtonProps} onClick={this.props.onCancel}>
                            {`取消` || this.props.cancelText}
                        </Button>
                    </>
                )}
                {...restProps}
            />
        );
    }
};
