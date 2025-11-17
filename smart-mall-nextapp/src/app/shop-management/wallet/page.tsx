"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Tabs,
  Space,
  App,
  Spin,
  Typography,
  Divider,
  Alert,
  AutoComplete,
} from "antd";
import {
  WalletOutlined,
  DollarOutlined,
  BankOutlined,
  HistoryOutlined,
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import walletService, {
  WalletResponse,
  WithdrawalResponse,
  WalletTransactionResponse,
  CreateWalletRequest,
  UpdateBankInfoRequest,
  CreateWithdrawalRequest,
} from "@/services/WalletService";
import shopService from "@/services/ShopService";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// List of Vietnamese banks
const VIETNAMESE_BANKS = [
  "Vietcombank - Ngân hàng TMCP Ngoại Thương Việt Nam",
  "VietinBank - Ngân hàng TMCP Công Thương Việt Nam",
  "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
  "Agribank - Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam",
  "OCB - Ngân hàng TMCP Phương Đông",
  "MBBank - Ngân hàng TMCP Quân đội",
  "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam",
  "ACB - Ngân hàng TMCP Á Châu",
  "VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng",
  "TPBank - Ngân hàng TMCP Tiên Phong",
  "Sacombank - Ngân hàng TMCP Sài Gòn Thương Tín",
  "HDBank - Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh",
  "VIB - Ngân hàng TMCP Quốc tế Việt Nam",
  "SHB - Ngân hàng TMCP Sài Gòn - Hà Nội",
  "Eximbank - Ngân hàng TMCP Xuất Nhập khẩu Việt Nam",
  "MSB - Ngân hàng TMCP Hàng Hải",
  "CAKE by VPBank",
  "Ubank by VPBank",
  "Timo by VPBank",
  "VietCapitalBank - Ngân hàng TMCP Bản Việt",
  "SCB - Ngân hàng TMCP Sài Gòn",
  "VietBank - Ngân hàng TMCP Việt Nam Thương Tín",
  "PVcomBank - Ngân hàng TMCP Đại Chúng Việt Nam",
  "Oceanbank - Ngân hàng Thương mại TNHH MTV Đại Dương",
  "NCB - Ngân hàng TMCP Quốc Dân",
  "ShinhanBank - Ngân hàng TNHH MTV Shinhan Việt Nam",
  "ABBANK - Ngân hàng TMCP An Bình",
  "VietABank - Ngân hàng TMCP Việt Á",
  "NamABank - Ngân hàng TMCP Nam Á",
  "PGBank - Ngân hàng TMCP Xăng dầu Petrolimex",
  "VietBank - Ngân hàng TMCP Việt Nam Thương Tín",
  "BacABank - Ngân hàng TMCP Bắc Á",
  "PVcomBank - Ngân hàng TMCP Đại Chúng Việt Nam",
  "Woori Bank - Ngân hàng TNHH MTV Woori Việt Nam",
  "KookminBank - Ngân hàng Kookmin - Chi nhánh Hà Nội",
  "CIMB Bank - Ngân hàng TNHH MTV CIMB Việt Nam",
  "LienVietPostBank - Ngân hàng TMCP Bưu Điện Liên Việt",
  "KienLongBank - Ngân hàng TMCP Kiên Long",
  "KBank - Ngân hàng Đại chúng TNHH Kasikornbank",
  "BaoVietBank - Ngân hàng TMCP Bảo Việt",
  "SeABank - Ngân hàng TMCP Đông Nam Á",
  "COOPBANK - Ngân hàng Hợp tác xã Việt Nam",
  "CBBank - Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam",
  "DongABank - Ngân hàng TMCP Đông Á",
  "GPBank - Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu",
  "OceanBank - Ngân hàng Thương mại TNHH MTV Đại Dương",
  "UnitedOverseas Bank - Ngân hàng United Overseas Bank - Chi nhánh TP.HCM",
  "Standard Chartered Bank - Ngân hàng TNHH MTV Standard Chartered (Việt Nam)",
  "HSBC - Ngân hàng TNHH MTV HSBC Việt Nam",
  "Public Bank - Ngân hàng TNHH MTV Public Việt Nam",
  "Hongleong Bank - Ngân hàng TNHH MTV Hong Leong Việt Nam",
  "IBK - Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh TP.HCM",
  "Nonghyup Bank - Ngân hàng Nonghyup - Chi nhánh Hà Nội",
  "Indian Oversea Bank - Ngân hàng Indian Oversea - Chi nhánh TP.HCM",
  "Mizuho Bank - Ngân hàng Mizuho - Chi nhánh Hà Nội",
  "MUFG Bank - Ngân hàng MUFG - Chi nhánh TP.HCM",
];

export default function WalletPage() {
  const { data: session } = useSession();
  const { message, modal } = App.useApp();
  
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalResponse[]>([]);
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  
  // Pagination
  const [withdrawalPage, setWithdrawalPage] = useState(0);
  const [withdrawalTotal, setWithdrawalTotal] = useState(0);
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionTotal, setTransactionTotal] = useState(0);
  
  // Modals
  const [createWalletModalVisible, setCreateWalletModalVisible] = useState(false);
  const [updateBankModalVisible, setUpdateBankModalVisible] = useState(false);
  const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
  
  // Forms
  const [createWalletForm] = Form.useForm();
  const [updateBankForm] = Form.useForm();
  const [withdrawalForm] = Form.useForm();

  // Fetch shop ID
  useEffect(() => {
    const fetchShopId = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await shopService.getShopsByOwner(session.user.id);
        if (response.data && response.data.length > 0) {
          setShopId(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch shop:', error);
      }
    };

    fetchShopId();
  }, [session?.user?.id]);

  // Fetch wallet data
  useEffect(() => {
    if (shopId) {
      fetchWalletData();
    }
  }, [shopId]);

  const fetchWalletData = async () => {
    if (!shopId) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await walletService.getWallet(shopId);
      
      // Backend may return: { status, message, data: wallet } OR just wallet object
      // Check both cases
      let walletData: WalletResponse | null = null;
      
      if (response?.data) {
        // Case 1: { status, message, data: wallet }
        walletData = response.data;
      } else if (response && 'id' in response) {
        // Case 2: Direct wallet object
        walletData = response as unknown as WalletResponse;
      }
      
      if (walletData && walletData.id) {
        setWallet(walletData);
        
        // If wallet exists, fetch withdrawal requests and transactions
        await Promise.all([
          fetchWithdrawalRequests(),
          fetchTransactions(),
        ]);
      } else {
        setWallet(null);
      }
    } catch (error: any) {
      // If wallet doesn't exist (404), it's not an error
      if (error.response?.status === 404) {
        setWallet(null);
      } else {
        message.error(error.response?.data?.message || 'Failed to fetch wallet data');
        console.error('Failed to fetch wallet:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async (page: number = 0) => {
    if (!shopId) return;
    
    try {
      const response = await walletService.getWithdrawalRequests(shopId, page, 10);
      if (response?.data?.content) {
        setWithdrawalRequests(response.data.content);
        setWithdrawalTotal(response.data.totalElements || 0);
        setWithdrawalPage(page);
      } else {
        setWithdrawalRequests([]);
        setWithdrawalTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error);
      setWithdrawalRequests([]);
      setWithdrawalTotal(0);
    }
  };

  const fetchTransactions = async (page: number = 0) => {
    if (!shopId) return;
    
    try {
      const response = await walletService.getTransactions(shopId, page, 20);
      if (response?.data?.content) {
        setTransactions(response.data.content);
        setTransactionTotal(response.data.totalElements || 0);
        setTransactionPage(page);
      } else {
        setTransactions([]);
        setTransactionTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
      setTransactionTotal(0);
    }
  };

  // Create wallet
  const handleCreateWallet = async (values: CreateWalletRequest) => {
    if (!shopId) return;
    
    try {
      const response = await walletService.createWallet(shopId, values);
      message.success('Wallet created successfully');
      setCreateWalletModalVisible(false);
      createWalletForm.resetFields();
      // Fetch complete wallet data after creation
      await fetchWalletData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create wallet');
      console.error('Failed to create wallet:', error);
    }
  };

  // Update bank info
  const handleUpdateBankInfo = async (values: UpdateBankInfoRequest) => {
    if (!shopId) return;
    
    try {
      const response = await walletService.updateBankInfo(shopId, values);
      setWallet(response.data);
      message.success('Bank information updated successfully');
      setUpdateBankModalVisible(false);
      updateBankForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update bank information');
      console.error('Failed to update bank info:', error);
    }
  };

  // Create withdrawal request
  const handleCreateWithdrawal = async (values: CreateWithdrawalRequest) => {
    if (!shopId || !wallet) return;
    
    // Validate amount
    if (values.amount < 50000) {
      message.error('Minimum withdrawal amount is 50,000 VND');
      return;
    }
    
    if (values.amount > wallet.balance) {
      message.error('Withdrawal amount exceeds available balance');
      return;
    }
    
    try {
      await walletService.createWithdrawalRequest(shopId, values);
      message.success('Withdrawal request created successfully');
      setWithdrawalModalVisible(false);
      withdrawalForm.resetFields();
      fetchWalletData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create withdrawal request');
      console.error('Failed to create withdrawal:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Withdrawal status tag
  const getStatusTag = (status: string) => {
    const statusMap: { [key: string]: { color: string; text: string } } = {
      PENDING: { color: 'gold', text: 'Pending' },
      APPROVED: { color: 'blue', text: 'Approved' },
      REJECTED: { color: 'red', text: 'Rejected' },
      COMPLETED: { color: 'green', text: 'Completed' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  // Transaction type tag
  const getTransactionTypeTag = (type: string) => {
    const typeMap: { [key: string]: { color: string; text: string } } = {
      ORDER_PAYMENT: { color: 'green', text: 'Order Payment' },
      WITHDRAWAL: { color: 'orange', text: 'Withdrawal' },
      REFUND: { color: 'blue', text: 'Refund' },
      ADJUSTMENT: { color: 'purple', text: 'Adjustment' },
    };
    const { color, text } = typeMap[type] || { color: 'default', text: type };
    return <Tag color={color}>{text}</Tag>;
  };

  // Withdrawal columns
  const withdrawalColumns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number) => (
        <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Bank',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Account',
      dataIndex: 'bankAccountNumber',
      key: 'bankAccountNumber',
      width: 150,
      render: (acc: string) => <span className="font-mono">{acc}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note: string) => note || '-',
    },
    {
      title: 'Admin Note',
      dataIndex: 'adminNote',
      key: 'adminNote',
      ellipsis: true,
      render: (adminNote: string) => adminNote || '-',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  // Transaction columns
  const transactionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => (
        <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => getTransactionTypeTag(type),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number, record: WalletTransactionResponse) => {
        const isPositive = record.type === 'ORDER_PAYMENT' || record.type === 'REFUND';
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : '-'}{formatCurrency(Math.abs(amount))}
          </span>
        );
      },
    },
    {
      title: 'Before',
      dataIndex: 'balanceBefore',
      key: 'balanceBefore',
      width: 140,
      render: (amount: number) => (
        <span className="text-gray-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'After',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 140,
      render: (amount: number) => (
        <span className="font-semibold">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Reference',
      dataIndex: 'referenceCode',
      key: 'referenceCode',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  // If wallet doesn't exist
  if (!wallet || !wallet.id) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12 px-4">
            <WalletOutlined className="text-6xl text-gray-400 mb-4" />
            <Title level={3}>No Wallet Found</Title>
            <Text className="text-gray-500 mb-6 block">
              You need to create a wallet to manage your shop's finances.
            </Text>
            <div className="flex justify-center mb-6">
              <Alert
                message="Important: Create Wallet with Bank Information"
                description="You must create a wallet with your bank account details before you can receive payments from completed orders. Orders completed before wallet creation will not be credited."
                type="warning"
                showIcon
                className="max-w-2xl text-left"
              />
            </div>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />}
              onClick={() => setCreateWalletModalVisible(true)}
            >
              Create Wallet
            </Button>
          </div>
        </Card>

        {/* Create Wallet Modal */}
        <Modal
          title="Create Wallet"
          open={createWalletModalVisible}
          onCancel={() => {
            setCreateWalletModalVisible(false);
            createWalletForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={createWalletForm}
            layout="vertical"
            onFinish={handleCreateWallet}
          >
            <Form.Item
              name="bankName"
              label="Bank Name"
              rules={[{ required: true, message: 'Please select or enter bank name' }]}
            >
              <AutoComplete
                options={VIETNAMESE_BANKS.map(bank => ({ value: bank }))}
                placeholder="Select or type bank name"
                filterOption={(inputValue, option) =>
                  option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              />
            </Form.Item>
            <Form.Item
              name="bankAccountNumber"
              label="Bank Account Number"
              rules={[
                { required: true, message: 'Please enter account number' },
                { pattern: /^\d+$/, message: 'Account number must be numeric' }
              ]}
            >
              <Input placeholder="1234567890" />
            </Form.Item>
            <Form.Item
              name="bankAccountName"
              label="Account Holder Name"
              rules={[{ required: true, message: 'Please enter account holder name' }]}
            >
              <Input placeholder="NGUYEN VAN A" />
            </Form.Item>
            <Form.Item>
              <Space className="w-full justify-end">
                <Button onClick={() => {
                  setCreateWalletModalVisible(false);
                  createWalletForm.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Create Wallet
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  // If wallet exists
  return (
    <div className="space-y-6">
      {/* Wallet Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Available Balance"
              value={wallet.balance}
              precision={0}
              prefix="₫"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Earned"
              value={wallet.totalEarned}
              precision={0}
              prefix="₫"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Withdrawn"
              value={wallet.totalWithdrawn}
              precision={0}
              prefix="₫"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={wallet.pendingAmount}
              precision={0}
              prefix="₫"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bank Information & Actions */}
      <Card 
        title={
          <Space>
            <BankOutlined />
            <span>Bank Information</span>
          </Space>
        }
        extra={
          <Space wrap>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchWalletData}
            >
              Refresh
            </Button>
            <Button 
              icon={<EditOutlined />}
              onClick={() => {
                updateBankForm.setFieldsValue({
                  bankName: wallet.bankName,
                  bankAccountNumber: wallet.bankAccountNumber,
                  bankAccountName: wallet.bankAccountName,
                });
                setUpdateBankModalVisible(true);
              }}
            >
              Update
            </Button>
            <Button 
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => {
                withdrawalForm.setFieldsValue({
                  bankName: wallet.bankName,
                  bankAccountNumber: wallet.bankAccountNumber,
                  bankAccountName: wallet.bankAccountName,
                });
                setWithdrawalModalVisible(true);
              }}
              disabled={wallet.balance < 50000}
            >
              Withdraw
            </Button>
          </Space>
        }
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <div className="mb-2">
              <Text strong className="text-gray-600">Bank Name</Text>
            </div>
            <div className="text-base">{wallet.bankName}</div>
          </Col>
          <Col xs={24} md={8}>
            <div className="mb-2">
              <Text strong className="text-gray-600">Account Number</Text>
            </div>
            <div className="text-base font-mono">{wallet.bankAccountNumber}</div>
          </Col>
          <Col xs={24} md={8}>
            <div className="mb-2">
              <Text strong className="text-gray-600">Account Holder</Text>
            </div>
            <div className="text-base uppercase">{wallet.bankAccountName}</div>
          </Col>
        </Row>
        {wallet.balance < 50000 && (
          <Alert
            message="Minimum withdrawal amount is 50,000 VND"
            type="info"
            showIcon
            className="mt-4"
          />
        )}
      </Card>

      {/* Tabs for Withdrawal Requests and Transactions */}
      <Card>
        <Tabs defaultActiveKey="withdrawals" size="large">
          <TabPane 
            tab={
              <span>
                <DollarOutlined />
                <span className="ml-2">Withdrawal Requests</span>
              </span>
            } 
            key="withdrawals"
          >
            <Table
              dataSource={withdrawalRequests}
              columns={withdrawalColumns}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                current: withdrawalPage + 1,
                pageSize: 10,
                total: withdrawalTotal,
                onChange: (page) => fetchWithdrawalRequests(page - 1),
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} requests`,
              }}
            />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <HistoryOutlined />
                <span className="ml-2">Transaction History</span>
              </span>
            } 
            key="transactions"
          >
            <Table
              dataSource={transactions}
              columns={transactionColumns}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                current: transactionPage + 1,
                pageSize: 20,
                total: transactionTotal,
                onChange: (page) => fetchTransactions(page - 1),
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} transactions`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Update Bank Info Modal */}
      <Modal
        title="Update Bank Information"
        open={updateBankModalVisible}
        onCancel={() => {
          setUpdateBankModalVisible(false);
          updateBankForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={updateBankForm}
          layout="vertical"
          onFinish={handleUpdateBankInfo}
        >
          <Form.Item
            name="bankName"
            label="Bank Name"
            rules={[{ required: true, message: 'Please select or enter bank name' }]}
          >
            <AutoComplete
              options={VIETNAMESE_BANKS.map(bank => ({ value: bank }))}
              placeholder="Select or type bank name"
              filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>
          <Form.Item
            name="bankAccountNumber"
            label="Bank Account Number"
            rules={[
              { required: true, message: 'Please enter account number' },
              { pattern: /^\d+$/, message: 'Account number must be numeric' }
            ]}
          >
            <Input placeholder="1234567890" />
          </Form.Item>
          <Form.Item
            name="bankAccountName"
            label="Account Holder Name"
            rules={[{ required: true, message: 'Please enter account holder name' }]}
          >
            <Input placeholder="NGUYEN VAN A" />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setUpdateBankModalVisible(false);
                updateBankForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Withdrawal Request Modal */}
      <Modal
        title="Request Withdrawal"
        open={withdrawalModalVisible}
        onCancel={() => {
          setWithdrawalModalVisible(false);
          withdrawalForm.resetFields();
        }}
        footer={null}
      >
        <Alert
          message={`Available Balance: ${formatCurrency(wallet.balance)}`}
          description="Minimum withdrawal: 50,000 VND"
          type="info"
          showIcon
          className="mb-4"
        />
        <Form
          form={withdrawalForm}
          layout="vertical"
          onFinish={handleCreateWithdrawal}
        >
          <Form.Item
            name="amount"
            label="Withdrawal Amount (VND)"
            rules={[
              { required: true, message: 'Please enter amount' },
              { 
                type: 'number', 
                min: 50000, 
                message: 'Minimum amount is 50,000 VND' 
              },
              { 
                validator: (_, value) => {
                  if (value > wallet.balance) {
                    return Promise.reject('Amount exceeds available balance');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              className="w-full"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value?.replace(/,/g, '') || 0)}
              placeholder="Enter amount"
              min={50000}
              max={wallet.balance}
            />
          </Form.Item>
          <Form.Item
            name="bankName"
            label="Bank Name"
            rules={[{ required: true, message: 'Please select or enter bank name' }]}
          >
            <AutoComplete
              options={VIETNAMESE_BANKS.map(bank => ({ value: bank }))}
              placeholder="Select or type bank name"
              filterOption={(inputValue, option) =>
                option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>
          <Form.Item
            name="bankAccountNumber"
            label="Bank Account Number"
            rules={[
              { required: true, message: 'Please enter account number' },
              { pattern: /^\d+$/, message: 'Account number must be numeric' }
            ]}
          >
            <Input placeholder="1234567890" />
          </Form.Item>
          <Form.Item
            name="bankAccountName"
            label="Account Holder Name"
            rules={[{ required: true, message: 'Please enter account holder name' }]}
          >
            <Input placeholder="NGUYEN VAN A" />
          </Form.Item>
          <Form.Item
            name="note"
            label="Note (Optional)"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Add a note for this withdrawal request"
            />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setWithdrawalModalVisible(false);
                withdrawalForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
