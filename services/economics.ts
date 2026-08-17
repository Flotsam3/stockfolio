export async function getEconomics(){
    try {
        const response = await fetch(`/api/economics/`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch economics data (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

