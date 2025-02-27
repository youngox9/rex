import React, { useRef, useContext, useState, useLayoutEffect, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Table, Button, Tooltip, Upload, message, Modal, Form, Input, Checkbox } from 'antd';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { EditOutlined, DeleteFilled,  PlusCircleFilled, UploadOutlined } from '@ant-design/icons';
import $ from 'jquery';

import ManagementModal from './ManagementModal';
import 'antd/dist/antd.css';

const Container = styled.div.attrs(props => ({
  style: props.style
}))`
  display: block;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 64px;
`;

const columnsSetting = ({ toggleModal,  setSelectedId }) => [
  {
    title: '標題',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '編輯',
    dataIndex: 'edit',
    key: 'edit',
    width: '100px',
    render(val, record) {
      return (
        <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => {
            // console.log(true, 'Edit', record);
            toggleModal(true, 'Edit', record);
          }}
        />
      );
    }
  }
];

const DEFAULT_RECORD = { title: '', des: null, pic: [], cover: { link: '' } };

function Management(props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      setSelectedId(null);
    }
  }, [modalOpen]);

  async function getData() {
    setLoading(true);
    const { data: newData } = await axios({
      url: 'https://mainpage-1c62.restdb.io/rest/data',
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'x-apikey': '005e404c56a25d2edc1adbd3aa32c248a09a5',
      }
    });
    setData(newData);
    setLoading(false);
  }

  function onChangeData(id, key, val) {
    const newData = data.reduce((prev, curr) => {
      if (curr._id === id) {
        return [...prev, { ...curr, [key]: val }];
      }
      return [...prev, curr];
    }, []);
    setData(newData);
  }

  async function onSave(record) {
    setLoading(true);
    const { _id } = record;
    const res = await axios({
      url: `https://mainpage-1c62.restdb.io/rest/data/${_id}`,
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-apikey': '005e404c56a25d2edc1adbd3aa32c248a09a5',
      },
      data: record
    });
    toggleModal(false);
    await getData();
    setLoading(false);
  }

  async function onAdd(record) {
    setLoading(true);
    const { _id } = record;
    const res = await axios({
      url: 'https://mainpage-1c62.restdb.io/rest/data',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-apikey': '005e404c56a25d2edc1adbd3aa32c248a09a5',
      },
      data: record
    });
    toggleModal(false);
    await getData();
    setLoading(false);
  }

  function toggleModal(isOpen, ac, record) {
    if (isOpen) {
      setAction(ac);
      if (action === 'Add') {
        setSelectedRecord(DEFAULT_RECORD);
      } else {
        setSelectedRecord(record);
      }
    } else {
      setSelectedRecord(null);
    }
  }

  const columns = columnsSetting({ onChangeData, setSelectedId, toggleModal });

  return (
    <Container>
      <Button
        icon={<PlusCircleFilled />}
        shape="circle"
        onClick={() => { toggleModal(true, 'Add'); }}
      />
      <Table dataSource={data} columns={columns} loading={loading} rowKey="_id" />
      <ManagementModal
        action={action}
        isOpen={!!selectedRecord}
        selectedRecord={selectedRecord}
        onSave={onSave}
        onAdd={onAdd}
        onCancel={() => toggleModal(false)}
      />
    </Container>
  );
}

export default Management;
