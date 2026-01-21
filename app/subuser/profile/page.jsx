import { getCurrentUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import SubuserProfileClient from "@/components/subuser/SubuserProfileClient";

export default async function SubuserProfilePage() {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/login');
    }

    // تحويل البيانات لتكون serializable
    const userData = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId?.toString() || null,
        image: user.image || null,
        createdAt: user.createdAt?.toISOString(),
    };

    return <SubuserProfileClient user={userData} />;
}
