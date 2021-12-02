import React from 'react';
import { Modal, Form, Input, Button } from '..';
import { connect, dispatch } from "../../store";
import axios from '../../axios';
import namespace from '../../utils/namespace';

const cls = namespace('bee-modal-login');

class ModalLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            sendCodeLoading: false,
            countDown: 0,
            loginLoading: false,
        };
        this.form = React.createRef();
    }

    componentWillUnmount() {
        clearInterval(this.countDownInter);
    }

    sendCode = async () => {
        const phone = this.form.current.getFieldValue('phone');
        if (!/1\d{10}/.test(phone)) {
            this.setState({ error: '请输入正确的手机号！'});
            return;
        }

        this.setState({ error: '', sendCodeLoading: true });

        try {
            await axios.post('/send_code', {
                phone: `+86${phone}`,
            });
            this.setState({ countDown: 59 });
            this.countDownInter = setInterval(() => {
                if (this.state.countDown === 0) {
                    clearInterval(this.countDownInter);
                } else {
                    this.setState({ countDown: this.state.countDown - 1 });
                }
            }, 1000);
        } catch (e) {
            this.setState({ error: e.message || '发送失败' });
        } finally {
            this.setState({ sendCodeLoading: false });
        }
    }

    login = async () => {
        const phone = this.form.current.getFieldValue('phone');
        const code = this.form.current.getFieldValue('code');
        if (!/1\d{10}/.test(phone)) {
            this.setState({ error: '请输入正确的手机号！'});
            return;
        }

        if (!/\d{6}/.test(code)) {
            this.setState({ error: '请输入正确的验证码！'});
            return;
        }

        this.setState({ loginLoading: true, error: '' });

        try {
            const { data } = await axios.post('/phone_login', {
                phone: `+86${phone}`,
                code: code,
            });
            dispatch({ type: 'LOGIN', data });
        } catch(e) {
            this.setState({ error: e.message || '登陆失败' });
            this.form.current.setFieldsValue({ code: '' });
        } finally {
            this.setState({ loginLoading: false });
        }
    }

    onClose = () => {
        this.setState({ error: '' });
        dispatch({ type: 'HIDE_LOGIN_MODEL' });
    }

    render() {
        return (
            <Modal.Simple
                visible={this.props.loginModelVisible}
                onCancel={this.onClose}
            >
                <Form className={cls()} onFinish={this.login} ref={this.form}>
                    <div className={cls('header')}>
                        <div className={cls('title')}>短信验证码登录/注册</div>
                        <div className={cls('error')}>{this.state.error}</div>
                    </div>
                    <Form.Item name="phone">
                        <Input maxLength={11} prefix="+86" placeholder="手机号" />
                    </Form.Item>
                    <Form.Item name="code">
                        <Input
                            placeholder="验证码"
                            maxLength={6}
                            addonAfter={
                                this.state.countDown
                                    ? `${this.state.countDown}s`
                                    : (
                                        !this.state.sendCodeLoading
                                            ? <span onClick={this.sendCode} style={{ cursor: 'pointer' }}>发送验证码</span>
                                            : "发送验证码"
                                    )
                            }
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className={cls('btn-login')} loading={this.state.loginLoading}>
                            登录/注册
                        </Button>
                    </Form.Item>
                </Form>
            </Modal.Simple>
        )
    }
}

const mapStateToProps = ({ loginModelVisible }) => ({ loginModelVisible })
export default connect(mapStateToProps, ModalLogin);
