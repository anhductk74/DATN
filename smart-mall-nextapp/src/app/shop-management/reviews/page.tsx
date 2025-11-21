"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Rate,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Tag,
  Image,
  Space,
  Divider,
  Badge,
  Avatar,
  Tooltip,
  DatePicker,
  Pagination,
  Empty,
  Spin,
  message,
  Typography,
  Progress,
  App
} from "antd";
import {
  StarFilled,
  StarOutlined,
  MessageOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  ShopOutlined,
  UserOutlined,
  CalendarOutlined,
  CommentOutlined
} from "@ant-design/icons";
import reviewApiService, { ReviewResponseDto, ReviewReplyResponseDto as ReviewReplyInReview } from "@/services/ReviewApiService";
import reviewReplyApiService, { ReviewReplyRequestDto, ReviewReplyResponseDto } from "@/services/ReviewReplyApiService";
import shopService, { Shop } from "@/services/ShopService";
import { getCloudinaryUrl } from "@/config/config";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function ShopReviewManagement() {
  const { data: session } = useSession();
  const { message } = App.useApp();
  const [selectedReview, setSelectedReview] = useState<ReviewResponseDto | null>(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [editingReply, setEditingReply] = useState(false);
  const [viewDetailsModalVisible, setViewDetailsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{
    rating?: number;
    hasReply?: boolean;
    productId?: string;
    sortBy?: 'reviewedAt' | 'rating';
    sortDirection?: 'asc' | 'desc';
  }>({
    sortBy: 'reviewedAt',
    sortDirection: 'desc'
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // Get owner ID from session
  const ownerId = session?.user?.id;



  // Fetch shop info by owner ID first
  const { data: shopData, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ['shop-by-owner', ownerId],
    queryFn: async () => {
      if (!ownerId) throw new Error('Owner ID is required');
      const response = await shopService.getShopsByOwner(ownerId);
      return response.data && response.data.length > 0 ? response.data[0] : null;
    },
    enabled: !!ownerId, // Only run when ownerId exists
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const shopId = shopData?.id;

  // Fetch shop review statistics (only when shopId is available)
  const { data: shopStats, isLoading: statsLoading } = useQuery({
    queryKey: ['shop-review-stats', shopId],
    queryFn: () => reviewApiService.getShopReviewStatistics(shopId!),
    enabled: !!shopId, // Only run when shopId exists
    staleTime: 5 * 60 * 1000,
  });

  // Fetch shop reviews (only when shopId is available)
  const { 
    data: reviewsData, 
    isLoading: reviewsLoading, 
    refetch: refetchReviews 
  } = useQuery({
    queryKey: ['shop-reviews', shopId, currentPage, pageSize, filters],
    queryFn: () => reviewApiService.getReviewsForShop(shopId!, currentPage, pageSize, filters),
    enabled: !!shopId, // Only run when shopId exists
    staleTime: 30 * 1000,
  });

  // Fetch products summary (only when shopId is available)
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products-summary', shopId],
    queryFn: () => reviewApiService.getShopProductsWithReviewSummary(shopId!, 0, 50),
    enabled: !!shopId, // Only run when shopId exists
    staleTime: 5 * 60 * 1000,
  });

  // Fetch shop replies (only when shopId is available)
  const { data: repliesData, isLoading: repliesLoading } = useQuery({
    queryKey: ['shop-replies', shopId],
    queryFn: () => reviewReplyApiService.getRepliesByShop(shopId!, 0, 100),
    enabled: !!shopId, // Only run when shopId exists
    staleTime: 2 * 60 * 1000,
  });

  // Reply to review mutation
  const replyMutation = useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) => {
      if (!shopId) throw new Error('Shop ID is required');
      const dto: ReviewReplyRequestDto = {
        reviewId,
        shopId,
        replyContent: content
      };
      return reviewReplyApiService.createReply(dto);
    },
    onSuccess: (data) => {
      console.log('Reply sent successfully:', data);
      message.success('Reply sent successfully!');
      // Add a small delay to ensure backend is updated
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['shop-reviews'] });
        queryClient.invalidateQueries({ queryKey: ['shop-review-stats'] });
        queryClient.invalidateQueries({ queryKey: ['shop-replies'] });
      }, 500);
      setReplyModalVisible(false);
      setSelectedReview(null);
      form.resetFields();
    },
    onError: (error) => {
      console.error('Failed to reply:', error);
      message.error('Failed to send reply');
    },
  });

  // Update reply mutation
  const updateReplyMutation = useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) => {
      if (!shopId) throw new Error('Shop ID is required');
      const dto: ReviewReplyRequestDto = {
        reviewId,
        shopId,
        replyContent: content
      };
      return reviewReplyApiService.updateReply(dto);
    },
    onSuccess: () => {
      message.success('Reply updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['shop-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['shop-review-stats'] });
      queryClient.invalidateQueries({ queryKey: ['shop-replies'] });
      setReplyModalVisible(false);
      setEditingReply(false);
      setSelectedReview(null);
      form.resetFields();
    },
    onError: (error) => {
      console.error('Failed to update reply:', error);
      message.error('Failed to update reply');
    },
  });

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: (reviewId: string) => reviewReplyApiService.deleteReply(reviewId),
    onSuccess: () => {
      message.success('Reply deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['shop-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['shop-review-stats'] });
      queryClient.invalidateQueries({ queryKey: ['shop-replies'] });
    },
    onError: (error) => {
      console.error('Failed to delete reply:', error);
      message.error('Failed to delete reply');
    },
  });

  const handleReply = async (review: ReviewResponseDto) => {
    setSelectedReview(review);
    setEditingReply(false);
    setReplyModalVisible(true);
    
    // Try to fetch existing reply for this review
    try {
      const existingReply = await reviewReplyApiService.getReplyByReview(review.id);
      if (existingReply) {
        form.setFieldsValue({ content: existingReply.replyContent });
      }
    } catch (error) {
      // No existing reply found, which is fine for new replies
      form.resetFields();
    }
  };

  const handleEditReply = async (review: ReviewResponseDto) => {
    setSelectedReview(review);
    setEditingReply(true);
    setReplyModalVisible(true);
    
    // Fetch existing reply for editing
    try {
      const existingReply = await reviewReplyApiService.getReplyByReview(review.id);
      form.setFieldsValue({ content: existingReply.replyContent || '' });
    } catch (error) {
      console.error('Failed to fetch existing reply:', error);
      message.error('Failed to load existing reply');
      setReplyModalVisible(false);
    }
  };

  const handleSubmitReply = (values: { content: string }) => {
    if (!selectedReview || !shopId) {
      message.error('Shop information is required');
      return;
    }

    if (editingReply && selectedReview.shopReply) {
      updateReplyMutation.mutate({
        reviewId: selectedReview.id,
        content: values.content,
      });
    } else {
      replyMutation.mutate({
        reviewId: selectedReview.id,
        content: values.content,
      });
    }
  };

  const handleDeleteReply = (reviewId: string) => {
    Modal.confirm({
      title: 'Delete Reply',
      content: 'Are you sure you want to delete this reply?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteReplyMutation.mutate(reviewId),
    });
  };

  const handleViewDetails = (review: ReviewResponseDto) => {
    setSelectedReview(review);
    setViewDetailsModalVisible(true);
  };

  const renderStarRating = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarFilled 
            key={star} 
            style={{
              fontSize: `${size}px`,
              color: star <= rating ? '#fbbf24' : '#d1d5db',
            }}
          />
        ))}
      </div>
    );
  };

  // Helper function to check if review has reply
  const hasReply = (reviewId: string): ReviewReplyInReview | null => {
    const reviewWithReply = reviewsData?.content?.find(review => review.id === reviewId);
    return reviewWithReply?.shopReply || null;
  };

  // Helper function to get reply for a review
  const getReplyForReview = (reviewId: string): ReviewReplyInReview | null => {
    const reviewWithReply = reviewsData?.content?.find(review => review.id === reviewId);
    console.log('Getting reply for review:', reviewId, 'found:', reviewWithReply?.shopReply);
    return reviewWithReply?.shopReply || null;
  };

  // Helper function to get reply content (handles both content and replyContent fields)
  const getReplyContent = (reply: any): string => {
    console.log('Getting reply content from:', reply);
    const content = reply?.content || reply?.replyContent || '';
    console.log('Reply content result:', content);
    return content;
  };

  const reviewColumns = [
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'customer',
      render: (userName: string, record: ReviewResponseDto) => (
        <div className="flex items-center space-x-3">
          {record.userAvatar ? (
            <Image
              src={getCloudinaryUrl(record.userAvatar)}
              alt={userName}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
          <div>
            <div className="font-medium text-gray-900">{userName}</div>
            <div className="text-sm text-gray-500">
              {new Date(record.reviewedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'product',
      render: (productName: string) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{productName}</div>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className="flex items-center space-x-2">
          {renderStarRating(rating)}
          <span className="text-sm font-medium">{rating}/5</span>
        </div>
      ),
    },
    {
      title: 'Review',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string, record: ReviewResponseDto) => (
        <div className="max-w-sm">
          <p className="text-gray-700 line-clamp-2">{comment}</p>
          {record.mediaList && record.mediaList.length > 0 && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <EyeOutlined className="mr-1" />
              {record.mediaList.length} media file(s)
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: ReviewResponseDto) => {
        const reply = getReplyForReview(record.id);
        return (
          <div>
            {reply ? (
              <Tag color="green">Replied</Tag>
            ) : (
              <Tag color="orange">Pending Reply</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ReviewResponseDto) => {
        const reply = getReplyForReview(record.id);
        return (
          <Space size="small">
            <Tooltip title="View Details">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDetails(record)}
              />
            </Tooltip>
            
            {reply ? (
              <>
                <Tooltip title="Edit Reply">
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditReply(record)}
                  />
                </Tooltip>
                <Tooltip title="Delete Reply">
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() => handleDeleteReply(record.id)}
                  />
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Reply">
                <Button
                  icon={<MessageOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => handleReply(record)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Show loading while fetching session or shop info
  if (!session || shopLoading || (!shopLoading && !shopId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spin size="large" />
        {!session && (
          <div className="mt-4 text-center">
            <div className="text-gray-600 mb-2">
              Please login to access review management
            </div>
          </div>
        )}
        {session && !shopLoading && !shopId && (
          <div className="mt-4 text-center">
            <div className="text-gray-600 mb-2">
              No shop found for your account
            </div>
            {shopError && (
              <div className="text-red-500 text-sm">
                Error: {shopError instanceof Error ? shopError.message : 'Unknown error'}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-2">
              Please create a shop first to manage reviews.
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show loading for other data
  if (statsLoading || repliesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="flex items-center">
            <CommentOutlined className="mr-3 text-blue-600" />
            Review Management
          </Title>
          <Paragraph className="text-gray-600 text-lg">
            Manage customer reviews and ratings for your products
          </Paragraph>
          {shopData && (
            <div className="mt-2 text-sm text-gray-500">
              Managing reviews for: <span className="font-medium text-blue-600">{shopData.name}</span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Reviews"
                value={shopStats?.totalReviews || 0}
                prefix={<CommentOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average Rating"
                value={shopStats?.averageRating || 0}
                precision={1}
                prefix={<StarFilled />}
                suffix="/ 5"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Replies"
                value={repliesData?.length || 0}
                prefix={<MessageOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Replies"
                value={shopStats?.pendingReplyCount || 0}
                prefix={<MessageOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Rating Distribution */}
        {shopStats && (
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} lg={12}>
              <Card title="Rating Distribution" className="h-full">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center w-16">
                        <span className="text-sm w-2">{rating}</span>
                        <StarFilled className="text-yellow-400 ml-1" />
                      </div>
                      <div className="flex-1">
                        <Progress
                          percent={shopStats.totalReviews > 0 
                            ? ((shopStats.ratingCounts[rating] || 0) / shopStats.totalReviews) * 100 
                            : 0}
                          showInfo={false}
                          strokeColor="#faad14"
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {shopStats.ratingCounts[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Monthly Trend" className="h-full">
                {shopStats.monthlyTrend && shopStats.monthlyTrend.length > 0 ? (
                  <div className="space-y-2">
                    {shopStats.monthlyTrend.slice(0, 6).map((month) => (
                      <div key={month.yearMonth} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{month.yearMonth}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{month.totalReviews} reviews</span>
                          <span className="text-sm text-yellow-600">
                            {month.averageRating.toFixed(1)}★
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="No data available" />
                )}
              </Card>
            </Col>
          </Row>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Select
                placeholder="Filter by Rating"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
              >
                <Option value={5}>5 Stars</Option>
                <Option value={4}>4 Stars</Option>
                <Option value={3}>3 Stars</Option>
                <Option value={2}>2 Stars</Option>
                <Option value={1}>1 Star</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Reply Status"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setFilters(prev => ({ ...prev, hasReply: value }))}
              >
                <Option value={true}>Replied</Option>
                <Option value={false}>Pending Reply</Option>
              </Select>
            </Col>
            <Col>
              <Select
                placeholder="Sort by"
                value={`${filters.sortBy},${filters.sortDirection}`}
                style={{ width: 150 }}
                onChange={(value) => {
                  const [sortBy, sortDirection] = value.split(',');
                  setFilters(prev => ({ 
                    ...prev, 
                    sortBy: sortBy as 'reviewedAt' | 'rating',
                    sortDirection: sortDirection as 'asc' | 'desc'
                  }));
                }}
              >
                <Option value="reviewedAt,desc">Newest First</Option>
                <Option value="reviewedAt,asc">Oldest First</Option>
                <Option value="rating,desc">Highest Rating</Option>
                <Option value="rating,asc">Lowest Rating</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Reviews Table */}
        <Card>
          <Table
            columns={reviewColumns}
            dataSource={reviewsData?.content || []}
            loading={reviewsLoading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
          />
          
          {reviewsData && reviewsData.totalElements > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage + 1}
                pageSize={pageSize}
                total={reviewsData.totalElements}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} reviews`
                }
                onChange={(page, size) => {
                  setCurrentPage(page - 1);
                  setPageSize(size || 10);
                }}
              />
            </div>
          )}
        </Card>

        {/* Reply Modal */}
        <Modal
          title={editingReply ? "Edit Reply" : "Reply to Review"}
          open={replyModalVisible}
          onCancel={() => {
            setReplyModalVisible(false);
            setSelectedReview(null);
            setEditingReply(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          {selectedReview && (
            <div className="mb-6">
              {/* Original Review */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-start space-x-3">
                  {selectedReview.userAvatar ? (
                    <Image
                      src={getCloudinaryUrl(selectedReview.userAvatar)}
                      alt={selectedReview.userName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} size={40} />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{selectedReview.userName}</span>
                      {renderStarRating(selectedReview.rating)}
                    </div>
                    <p className="text-gray-700">{selectedReview.comment}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      {new Date(selectedReview.reviewedAt).toLocaleDateString()}
                    </div>
                    {selectedReview.mediaList && selectedReview.mediaList.length > 0 && (
                      <div className="flex items-center mt-2 text-sm text-blue-600">
                        <EyeOutlined className="mr-1" />
                        {selectedReview.mediaList.length} media file(s)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Existing Reply (if any) */}
              {editingReply && (
                (() => {
                  const existingReply = getReplyForReview(selectedReview.id);
                  return existingReply ? (
                    <div className="p-4 bg-blue-50 rounded-lg mb-4">
                      <div className="flex items-start space-x-3">
                        <Avatar icon={<ShopOutlined />} size={32} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-blue-600">{existingReply.shopName}</span>
                            <Tag color="blue">Shop Reply</Tag>
                          </div>
                          <p className="text-gray-700">{getReplyContent(existingReply)}</p>
                          <div className="text-sm text-gray-500 mt-2">
                            {new Date(existingReply.repliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()
              )}
            </div>
          )}
          
          <Form
            form={form}
            onFinish={handleSubmitReply}
            layout="vertical"
          >
            <Form.Item
              name="content"
              label="Your Reply"
              rules={[
                { required: true, message: 'Please enter your reply' },
                { min: 5, message: 'Reply must be at least 5 characters' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Write your reply to this review..."
                maxLength={500}
                showCount
              />
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={replyMutation.isPending || updateReplyMutation.isPending}
                  icon={<SendOutlined />}
                >
                  {editingReply ? 'Update Reply' : 'Send Reply'}
                </Button>
                <Button onClick={() => setReplyModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* View Details Modal */}
        <Modal
          title="Review Details"
          open={viewDetailsModalVisible}
          onCancel={() => {
            setViewDetailsModalVisible(false);
            setSelectedReview(null);
          }}
          footer={[
            <Button key="close" onClick={() => setViewDetailsModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedReview && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                {selectedReview.userAvatar ? (
                  <Image
                    src={getCloudinaryUrl(selectedReview.userAvatar)}
                    alt={selectedReview.userName}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} size={60} />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-lg">{selectedReview.userName}</span>
                    <div className="flex items-center space-x-1">
                      {renderStarRating(selectedReview.rating, 18)}
                      <span className="font-medium ml-2">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Product: <span className="font-medium text-gray-700">{selectedReview.productName}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Reviewed on: {new Date(selectedReview.reviewedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-4 border-l-4 border-blue-400 bg-blue-50">
                <h4 className="font-semibold mb-2 text-gray-800">Customer Review</h4>
                <p className="text-gray-700 leading-relaxed">{selectedReview.comment}</p>
              </div>

              {/* Review Media */}
              {selectedReview.mediaList && selectedReview.mediaList.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <EyeOutlined className="mr-2" />
                    Media Files ({selectedReview.mediaList.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReview.mediaList.map((media, index) => (
                      <div key={media.id} className="relative">
                        {media.mediaType === 'IMAGE' ? (
                          <Image
                            src={getCloudinaryUrl(media.mediaUrl)}
                            alt={`Review image ${index + 1}`}
                            className="rounded-lg"
                            style={{ width: '100%', height: 150, objectFit: 'cover' }}
                            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E"
                            preview={{
                              src: getCloudinaryUrl(media.mediaUrl),
                            }}
                          />
                        ) : (
                          <div 
                            className="relative overflow-hidden rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow bg-gray-100 flex items-center justify-center"
                            style={{ width: '100%', height: 150 }}
                            onClick={() => {
                              window.open(getCloudinaryUrl(media.mediaUrl), '_blank');
                            }}
                          >
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎥</div>
                              <span className="text-sm text-gray-600">Video</span>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          {media.mediaType} • {new Date(media.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop Reply */}
              {(() => {
                const reply = getReplyForReview(selectedReview.id);
                return reply ? (
                  <div className="p-4 border-l-4 border-green-400 bg-green-50">
                    <div className="flex items-start space-x-3">
                      <Avatar icon={<ShopOutlined />} size={40} className="bg-green-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-green-700">{reply.shopName}</span>
                          <Tag color="green">Shop Reply</Tag>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{getReplyContent(reply)}</p>
                        <div className="text-sm text-gray-500 mt-2">
                          Replied on: {new Date(reply.repliedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-l-4 border-orange-400 bg-orange-50">
                    <div className="flex items-center space-x-2 text-orange-700">
                      <MessageOutlined />
                      <span className="font-medium">No reply yet</span>
                    </div>
                    <p className="text-gray-600 mt-1">This review is waiting for your response.</p>
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
