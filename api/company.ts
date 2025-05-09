// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export async function getCompany(name:string){
    try {
        const response = await fetch(`/companies/${name}`);
        let data;
        if (response.ok) {
            data = await response.json();
        }
        return data.company;
    } catch (error) {
        console.log(error);
    }
}

export async function createCompany(companyData: any){
    try {
        if (!companyData) return; 
        const response = await fetch(`/companies`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(companyData)
        });
        let data;
        if (response.ok){
            data = await response.json();
        }
        return data;
    } catch (error) {
        console.log(error);
    }
}

export async function updateCompany(name:string, companyData: any){
    try {
        if (!companyData) return; 
        const response = await fetch(`/companies/${name}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(companyData)
        });
        let data;
        if (response.ok){
            data = await response.json();
            return data.updatedCompany;
        }
        return data;
    } catch (error) {
        console.log(error);
    }
}