"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listBanks,
  createBank,
  updateBank,
  getAllTags,
  type BankCreateRequest,
  type BankUpdateRequest,
} from "@/lib/api/bank";
import type { BankVO } from "@/types";
import { getImageUploadCredentials } from "@/lib/api/file";
import { uploadImageToOss } from "@/lib/oss/upload-image";

export function BanksManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankVO | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coverImage: "",
    tagList: [] as string[],
    submitForReview: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const pageSize = 10;

  // 查询全部标签供选择
  const { data: tagOptions } = useQuery<string[]>({
    queryKey: ["allTags"],
    queryFn: getAllTags,
  });

  // 查询题库列表
  const { data, isLoading } = useQuery({
    queryKey: ["adminBanks", currentPage, searchTerm],
    queryFn: () =>
      listBanks({
        current: currentPage,
        size: pageSize,
        name: searchTerm || undefined,
      }),
  });

  const availableTags = (tagOptions ?? []).filter(
    (tag) => !formData.tagList.includes(tag)
  );

  // 创建题库
  const createMutation = useMutation({
    mutationFn: (data: BankCreateRequest) => createBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBanks"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  // 更新题库
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BankUpdateRequest }) =>
      updateBank(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBanks"] });
      setDialogOpen(false);
      resetForm();
    },
  });

  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const credentials = await getImageUploadCredentials();
      // 调试日志：检查返回的凭证数据
      console.log("获取到的STS凭证:", {
        ...credentials,
        accessKeyId: credentials.accessKeyId?.substring(0, 4) + "***",
        accessKeySecret: "***",
        securityToken: credentials.securityToken?.substring(0, 10) + "***",
        ossHost: credentials.ossHost,
      });
      return uploadImageToOss(file, credentials);
    },
  });

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized) {
      return;
    }

    setFormData((prev) => {
      if (prev.tagList.includes(normalized)) {
        return prev;
      }
      return {
        ...prev,
        tagList: [...prev.tagList, normalized],
      };
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tagList: prev.tagList.filter((item) => item !== tag),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      coverImage: "",
      tagList: [],
      submitForReview: false,
    });
    setEditingBank(null);
    setTagInput("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (bank: BankVO) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name || "",
      description: bank.description || "",
      coverImage: bank.coverImage || "",
      tagList: bank.tagList || [],
      submitForReview: false,
    });
    setDialogOpen(true);
    setTagInput("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBank) {
      updateMutation.mutate({
        id: editingBank.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCoverImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("请选择图片文件");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("图片大小不能超过 5MB");
      event.target.value = "";
      return;
    }

    setUploadError(null);

    imageUploadMutation.mutate(file, {
      onSuccess: (url) => {
        setFormData((prev) => ({
          ...prev,
          coverImage: url,
        }));
        event.target.value = "";
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "图片上传失败，请稍后重试";
        setUploadError(message);
        event.target.value = "";
      },
    });
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: "",
    }));
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">题库管理</h1>
          <p className="mt-2 text-gray-600">管理所有题库信息</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          新建题库
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="搜索题库名称..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* 题库列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">加载中...</div>
        ) : data?.records && data.records.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标签
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.records.map((bank) => (
                    <tr key={bank.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bank.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bank.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {bank.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {bank.tagList && bank.tagList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {bank.tagList.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {bank.tagList.length > 3 && (
                              <span className="px-2 py-1 text-gray-500 text-xs">
                                +{bank.tagList.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bank.status === 0
                              ? "bg-gray-100 text-gray-700"
                              : bank.status === 1
                              ? "bg-yellow-100 text-yellow-700"
                              : bank.status === 2
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {bank.status === 0
                            ? "草稿"
                            : bank.status === 1
                            ? "待审核"
                            : bank.status === 2
                            ? "已发布"
                            : "已拒绝"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {bank.createdAt
                          ? new Date(bank.createdAt).toLocaleDateString("zh-CN")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(bank)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {data.total > pageSize && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  共 {data.total} 条记录，第 {currentPage} / {data.pages || Math.ceil(data.total / pageSize)} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(
                          data.pages || Math.ceil(data.total / pageSize),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >= (data.pages || Math.ceil(data.total / pageSize))
                    }
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-600">
            暂无数据
          </div>
        )}
      </div>

      {/* 创建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBank ? "编辑题库" : "新建题库"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                题库名称 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入题库名称"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="请输入题库描述"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片
              </label>
              <div className="space-y-3">
                {formData.coverImage ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={formData.coverImage}
                      alt="题库封面"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                      aria-label="移除封面图片"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-500">
                    <p>尚未上传封面图片</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploadMutation.isPending}
                  >
                    {imageUploadMutation.isPending ? "上传中..." : "上传图片"}
                  </Button>
                  {formData.coverImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={handleRemoveCoverImage}
                    >
                      删除图片
                    </Button>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  默认支持 JPG / PNG / WebP，大小不超过 5MB。
                </p>

                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.tagList.length > 0 ? (
                    formData.tagList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full p-0.5 text-primary/70 transition hover:bg-primary/10 hover:text-primary"
                          aria-label={`移除标签 ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">暂未选择标签</span>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="输入标签后点击添加，可添加新标签"
                  />
                  <Button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim()}
                    className="sm:w-24"
                  >
                    添加
                  </Button>
                </div>

                {availableTags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      点击以下已有标签快速添加：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="submitForReview"
                checked={formData.submitForReview}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    submitForReview: e.target.checked,
                  })
                }
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label
                htmlFor="submitForReview"
                className="ml-2 text-sm text-gray-700"
              >
                提交审核（勾选后状态为待审核，否则为草稿）
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || updateMutation.isPending
                }
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "保存中..."
                  : "保存"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

