
const testDate = async () => {
    try {
        const dateStr = '2025-12-28';
        console.log("Sending date:", dateStr);

        const res = await fetch('http://localhost:3001/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: 'Date Test Request Fetch',
                description: 'Testing if date saves',
                type: 'Preventive',
                priority: 'Medium',
                equipmentId: 1,
                scheduledDate: dateStr
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        const data = await res.json();
        console.log("Created Request ID:", data.id);
        console.log("Returned ScheduledDate:", data.scheduledDate);

        // Verify fetching
        const listRes = await fetch('http://localhost:3001/api/requests');
        const listData = await listRes.json();
        const found = listData.find(r => r.id === data.id);

        console.log("Fetched Request ScheduledDate:", found.scheduledDate);

    } catch (error) {
        console.error("Error:", error.message);
    }
};

testDate();
