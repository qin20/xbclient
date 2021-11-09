import React from "react";
import { Form } from "antd";
import namespace from '../../utils/namespace';

const cls = namespace('bee-form');

class BeeForm extends React.PureComponent {
    render() {
        const {className = '', forwardedRef, ...restProps} = this.props;
        return (
            <Form ref={forwardedRef} className={`${cls()} ${className}`} {...restProps} />
        );
    }
};

export default React.forwardRef((props, ref) => (
    <BeeForm {...props} forwardedRef={ref} />
));
