export const issueTicket = async (serviceTypeId, retries = 2) => {
  try {
    const response = await fetch("http://localhost:3001/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceTypeId }),
    });

    if (!response.ok) {
      if (response.status === 400) throw new Error("Invalid service type");
      if (response.status >= 500) throw new Error("Service temporarily unavailable");
      throw new Error("Unexpected error");
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn("Retrying ticket issue...", retries);
      await new Promise((r) => setTimeout(r, 1000));
      return issueTicket(serviceTypeId, retries - 1);
    }
    throw error;
  }
};