import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from 'react';
import Select from 'react-select';

interface User {
    id: string;
    username: string;
    FirstName: string;
    FamilyName: string;
}

interface TransferCamelModalProps {
    isOpen: boolean;
    onClose: () => void;
    camel: {
        id: string;
        name: string;
        camelID: string;
    };
    onTransfer: (newOwnerId: string) => Promise<void>;
}

export const TransferCamelModal = ({
    isOpen,
    onClose,
    camel,
    onTransfer,
}: TransferCamelModalProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
            setUsersLoading(false);
        } catch (err) {
            setError("Failed to load users");
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const handleTransfer = async () => {
        try {
            setLoading(true);
            setError(null);
            await onTransfer(selectedUserId);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء نقل المطية");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>نقل ملكية المطية</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label>اسم المطية</label>
                        <p className="p-2 bg-gray-100 rounded">{camel.name}</p>
                    </div>
                    <div className="grid gap-2">
                        <label>رقم الشريحة</label>
                        <p className="p-2 bg-gray-100 rounded">{camel.camelID}</p>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <label>المالك الجديد</label>
                            <button
                                type="button"
                                onClick={fetchUsers}
                                disabled={usersLoading}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                تحديث
                            </button>
                        </div>
                        <Select
                            options={users.map(user => ({
                                value: user.id,
                                label: `${user.FirstName} ${user.FamilyName} - ${user.username}`
                            }))}
                            onChange={option => setSelectedUserId(option?.value || "")}
                            isLoading={usersLoading}
                            placeholder="ابحث عن المالك..."
                            isRtl
                            value={users
                                .map(user => ({
                                    value: user.id,
                                    label: `${user.FirstName} ${user.FamilyName} - ${user.username}`
                                }))
                                .find(option => option.value === selectedUserId) || null}
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
                <DialogFooter className='flex items-center justify-start gap-4'>
                    <Button onClick={onClose} variant="outline">
                        إلغاء
                    </Button>
                    <Button onClick={handleTransfer} disabled={loading || !selectedUserId}>
                        {loading ? "جاري النقل..." : "نقل الملكية"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};