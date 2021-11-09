import {Modal} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';

export function confirm(msg, title, options) {
    return new Promise((resolve, reject) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            title: title || '请确认',
            content: msg || null,
            okText: '确认',
            cancelText: '取消',
            afterClose: null,
            onOk: (close) => {
                close();
                resolve();
            },
            ...options,
        });
    });
}