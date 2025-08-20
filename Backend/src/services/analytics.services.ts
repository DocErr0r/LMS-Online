import { Model } from 'mongoose';

export const analyticsOfLastYear = async (model: Model<any>) => {
    const lastYearDate = new Date();
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
    lastYearDate.setMonth(lastYearDate.getMonth() + 1);
    lastYearDate.setDate(1);
    lastYearDate.setHours(12, 0, 0, 0);

    // model is Order then piple have group differnet
    let group = {
        _id: null,
        total: { $sum: 1 },
    };
    if (model.modelName === 'Order') {
        (group as any).revenue = { $sum: '10' };
    }

    const monthlyData = [];
    for (let i = 0; i < 12; i++) {
        const startMonth = new Date(lastYearDate);
        startMonth.setMonth(startMonth.getMonth() + i);

        const endDate = new Date(startMonth);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);

        const data = await model.aggregate([
            {
                $match: {
                    createdAt: { $gte: startMonth, $lte: endDate },
                },
            },
            {
                $group: group,
            },
        ]);
        const result = {
            month: startMonth
            .toLocaleDateString('default', {
                year: 'numeric',
                month: 'short',
                // day: 'numeric'
            })
            .replace(/ /g, '-'),
            total: data[0]?.total || 0,
        };
        
        if (model.modelName === 'Order') {
            (result as any).revenue = data[0]?.revenue || 0;
        }

        monthlyData.push(result);
    }

    return monthlyData;
};
