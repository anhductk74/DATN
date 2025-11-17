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
  TemporaryWalletSummary,
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
  const [temporaryWallet, setTemporaryWallet] = useState<TemporaryWalletSummary | null>(null);
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
  
  // Withdrawal state
  const [useDefaultBank, setUseDefaultBank] = useState(true);
  
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
        setTemporaryWallet(null); // Clear temporary wallet when main wallet exists
        
        // If wallet exists, fetch withdrawal requests and transactions
        await Promise.all([
          fetchWithdrawalRequests(),
          fetchTransactions(),
        ]);
      } else {
        setWallet(null);
        // Fetch temporary wallet if main wallet doesn't exist
        await fetchTemporaryWallet();
      }
    } catch (error: any) {
      // If wallet doesn't exist (404), fetch temporary wallet
      if (error.response?.status === 404) {
        setWallet(null);
        await fetchTemporaryWallet();
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

  const fetchTemporaryWallet = async () => {
    if (!shopId) return;
    
    try {
      const response = await walletService.getTemporaryWallet(shopId);
      if (response?.data) {
        setTemporaryWallet(response.data);
      } else if (response && 'temporaryWallets' in response) {
        setTemporaryWallet(response as unknown as TemporaryWalletSummary);
      } else {
        setTemporaryWallet(null);
      }
    } catch (error: any) {
      // If no temporary wallet (404), that's fine
      if (error.response?.status !== 404) {
        console.error('Failed to fetch temporary wallet:', error);
      }
      setTemporaryWallet(null);
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
              You need to create a wallet with your bank information to receive payments from completed orders.
            </Text>
            
            {/* Temporary Wallet Information */}
            {temporaryWallet && temporaryWallet.count > 0 && (
              <div className="mb-6 max-w-3xl mx-auto">
                <Alert
                  message={
                    <span className="font-semibold text-lg">
                      💰 You have {formatCurrency(temporaryWallet.totalAmount)} waiting!
                    </span>
                  }
                  description={
                    <div className="text-left mt-2">
                      <p className="mb-3">{temporaryWallet.message}</p>
                      <div className="bg-white p-4 rounded-md border">
                        <div className="mb-2">
                          <Text strong>Pending Orders: </Text>
                          <Text className="text-lg font-semibold text-green-600">
                            {temporaryWallet.count} {temporaryWallet.count === 1 ? 'order' : 'orders'}
                          </Text>
                        </div>
                        <div className="mb-3">
                          <Text strong>Total Amount: </Text>
                          <Text className="text-xl font-bold text-green-600">
                            {formatCurrency(temporaryWallet.totalAmount)}
                          </Text>
                        </div>
                        <Divider className="my-3" />
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {temporaryWallet.temporaryWallets.map((temp) => (
                            <div key={temp.id} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <Text className="text-xs text-gray-500">
                                  Order ID: {temp.orderId.substring(0, 8)}...
                                </Text>
                                <Text className="text-xs text-gray-400 ml-2">
                                  {new Date(temp.createdAt).toLocaleDateString('vi-VN')}
                                </Text>
                              </div>
                              <Text className="font-semibold text-green-600">
                                {formatCurrency(temp.amount)}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        ✅ When you create a wallet, all this money will be automatically transferred to your account!
                      </div>
                    </div>
                  }
                  type="success"
                  showIcon
                  icon={<ExclamationCircleOutlined />}
                  className="text-left"
                />
              </div>
            )}
            
            {/* Instructions */}
            <div className="flex justify-center mb-6">
              <Alert
                message="Important: Create Wallet with Bank Information"
                description={
                  <div className="space-y-2">
                    <p>To receive payments, you must create a wallet with valid bank account details:</p>
                    <ul className="list-disc list-inside text-left space-y-1">
                      <li>Bank name (select from Vietnamese banks)</li>
                      <li>Bank account number</li>
                      <li>Account holder name (must match your bank account)</li>
                    </ul>
                    {temporaryWallet && temporaryWallet.count > 0 ? (
                      <p className="mt-3 font-semibold text-green-700">
                        ✨ Creating your wallet will automatically transfer {formatCurrency(temporaryWallet.totalAmount)} from {temporaryWallet.count} completed {temporaryWallet.count === 1 ? 'order' : 'orders'}!
                      </p>
                    ) : (
                      <p className="mt-3 text-amber-700">
                        ⚠️ Orders completed before wallet creation will NOT be credited. Create your wallet now!
                      </p>
                    )}
                  </div>
                }
                type={temporaryWallet && temporaryWallet.count > 0 ? "success" : "warning"}
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
              {temporaryWallet && temporaryWallet.count > 0 
                ? `Create Wallet & Receive ${formatCurrency(temporaryWallet.totalAmount)}`
                : 'Create Wallet'
              }
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
          {temporaryWallet && temporaryWallet.count > 0 && (
            <Alert
              message="Pending Funds Will Be Transferred"
              description={`You have ${formatCurrency(temporaryWallet.totalAmount)} from ${temporaryWallet.count} completed ${temporaryWallet.count === 1 ? 'order' : 'orders'} waiting. This money will be automatically added to your wallet balance upon creation.`}
              type="info"
              showIcon
              className="mb-4"
            />
          )}
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
                  {temporaryWallet && temporaryWallet.count > 0 
                    ? 'Create Wallet & Transfer Funds'
                    : 'Create Wallet'
                  }
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
                setUseDefaultBank(true);
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
          setUseDefaultBank(true);
          withdrawalForm.resetFields();
        }}
        footer={null}
        width={600}
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
            label="Withdrawal Amount"
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
              size="large"
              formatter={value => {
                if (!value) return '';
                return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
              }}
              parser={value => Number(value?.replace(/,/g, '') || 0)}
              placeholder="0"
              prefix="₫"
              min={50000}
              max={wallet.balance}
              step={50000}
              controls={false}
              style={{ fontSize: '16px' }}
            />
          </Form.Item>
          
          {/* Quick Select Buttons */}
          <div className="mb-4">
            <Text className="text-sm text-gray-600 mb-2 block">Chọn nhanh số tiền:</Text>
            <Space wrap>
              {[
                { label: '25%', value: Math.floor(wallet.balance * 0.25) },
                { label: '50%', value: Math.floor(wallet.balance * 0.5) },
                { label: '75%', value: Math.floor(wallet.balance * 0.75) },
                { label: 'Rút hết', value: wallet.balance },
              ].filter(item => item.value >= 50000).map((item) => (
                <Button
                  key={item.label}
                  size="middle"
                  type={item.label === 'Rút hết' ? 'primary' : 'default'}
                  onClick={() => withdrawalForm.setFieldValue('amount', item.value)}
                >
                  {item.label} {item.label !== 'Rút hết' && `(${formatCurrency(item.value)})`}
                </Button>
              ))}
            </Space>
            <Divider className="my-3" />
            <Text className="text-sm text-gray-600 mb-2 block">Hoặc chọn số tiền cố định:</Text>
            <Space wrap>
              {[
                { label: '500K', value: 500000 },
                { label: '1 Triệu', value: 1000000 },
                { label: '5 Triệu', value: 5000000 },
                { label: '10 Triệu', value: 10000000 },
                { label: '50 Triệu', value: 50000000 },
              ].filter(item => item.value <= wallet.balance).map((item) => (
                <Button
                  key={item.label}
                  size="small"
                  onClick={() => withdrawalForm.setFieldValue('amount', item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </Space>
          </div>
          
          {/* Bank Account Selection */}
          <Divider className="my-4" />
          <div className="mb-4">
            <Text strong className="block mb-3">Chọn tài khoản nhận tiền:</Text>
            <Space direction="vertical" className="w-full">
              <Card
                className={`cursor-pointer transition-all ${useDefaultBank ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                size="small"
                onClick={() => {
                  setUseDefaultBank(true);
                  withdrawalForm.setFieldsValue({
                    bankName: wallet.bankName,
                    bankAccountNumber: wallet.bankAccountNumber,
                    bankAccountName: wallet.bankAccountName,
                  });
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {useDefaultBank && <Tag color="blue" className="mr-2">Đang chọn</Tag>}
                      <Text strong>Tài khoản mặc định</Text>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <Text className="text-gray-600">Ngân hàng: </Text>
                        <Text>{wallet.bankName}</Text>
                      </div>
                      <div>
                        <Text className="text-gray-600">Số TK: </Text>
                        <Text className="font-mono">{wallet.bankAccountNumber}</Text>
                      </div>
                      <div>
                        <Text className="text-gray-600">Chủ TK: </Text>
                        <Text className="uppercase">{wallet.bankAccountName}</Text>
                      </div>
                    </div>
                  </div>
                  <BankOutlined className="text-2xl text-blue-500" />
                </div>
              </Card>
              
              <Card
                className={`cursor-pointer transition-all ${!useDefaultBank ? 'border-orange-500 bg-orange-50' : 'hover:border-gray-400'}`}
                size="small"
                onClick={() => {
                  setUseDefaultBank(false);
                  withdrawalForm.setFieldsValue({
                    bankName: '',
                    bankAccountNumber: '',
                    bankAccountName: '',
                  });
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {!useDefaultBank && <Tag color="orange" className="mr-2">Đang chọn</Tag>}
                    <Text strong>Tài khoản khác</Text>
                    <div className="text-xs text-gray-500 mt-1">Nhập thông tin tài khoản mới</div>
                  </div>
                  <EditOutlined className="text-2xl text-orange-500" />
                </div>
              </Card>
            </Space>
          </div>
          
          {/* Bank Info Fields - Only show when using different account */}
          {!useDefaultBank && (
            <>
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
            </>
          )}
          
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
                setUseDefaultBank(true);
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
