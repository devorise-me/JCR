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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { translateAge, translateSex } from '@/lib/helper';

interface Loop {
    id: string;
    age: string;
    sex: string;
    number: number;
}

interface TransferLoopModalProps {
    isOpen: boolean;
    onClose: () => void;
    camel: {
        id: string;
        name: string;
        camelID: string;
        age: string;
        sex: string;
    };
    availableLoops: Loop[];
    currentLoopId: string;
    onTransfer: (camelId: number, newLoopId: string) => Promise<void>;
}

export const TransferLoopModal = ({
    isOpen,
    onClose,
    camel,
    availableLoops,
    currentLoopId,
    onTransfer,
}: TransferLoopModalProps) => {
    const [selectedLoopId, setSelectedLoopId] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTransfer = async () => {
        try {
            setLoading(true);
            setError(null);
            await onTransfer(Number(camel.id), selectedLoopId);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ أثناء نقل المطية للشوط الجديد");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>نقل المطية إلى شوط آخر</DialogTitle>
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
                        <label>الفئة والجنس الحالي</label>
                        <p className="p-2 bg-gray-100 rounded">
                            {translateAge(camel.age)} - {translateSex(camel.sex)}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <label>الشوط الجديد</label>
                        <Select
                            onValueChange={setSelectedLoopId}
                            value={selectedLoopId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الشوط الجديد" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableLoops
                                    .filter(loop =>
                                        loop.id !== currentLoopId &&
                                        loop.age === camel.age &&
                                        loop.sex === camel.sex)
                                    .map((loop) => (
                                        <SelectItem key={loop.id} value={loop.id}>
                                            شوط {loop.number} - {translateAge(loop.age)} {translateSex(loop.sex)}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
                <DialogFooter className='flex items-center justify-start gap-4'>
                    <Button onClick={onClose} variant="outline">
                        إلغاء
                    </Button>
                    <Button onClick={handleTransfer} disabled={loading || !selectedLoopId}>
                        {loading ? "جاري النقل..." : "نقل المطية"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};