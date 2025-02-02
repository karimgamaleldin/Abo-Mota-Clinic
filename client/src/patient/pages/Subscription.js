import { useFetchMyPackageQuery, useFetchFamilyPackageQuery } from '../../store';
import PackageCard from '../components/PackagesCard'


export default function Subscription() {
    
    const headerStyle = {
        textAlign: 'center', 
        color: '#2c3e50', 
    };

    const {data:myPackage, error, isFetching} = useFetchMyPackageQuery(); 
    const {data:familyPackages, isFetching:isFetching2}= useFetchFamilyPackageQuery(); 
    
    if(isFetching || isFetching2)
    {
        return <div>loading...</div>
    }

    let content =<div>no packages</div>;

    if(myPackage)
        content= <PackageCard data={myPackage}/>;
    
           
    const packages = familyPackages
    .filter(familyPackage => familyPackage.package&& familyPackage.status !== 'cancelled' )

    .map(familyPackage => <PackageCard data={familyPackage} />);

    
    return (
            <section style={{  maxWidth: '1536px', width: '100%' }} 
            className="mx-auto my-8  p-4 space-y-8 border-2 border-gray-300 rounded-lg ">
            <div>
            <h2 style={headerStyle} className="text-2xl font-bold my-8" >Your Packages</h2>
            <div className="flex justify-center items-center flex-wrap gap-8">
                {content}
            </div>
            </div>
            <div>
            <h2 style={headerStyle} className="text-2xl font-bold my-8" >Family Packages</h2>
            <div className="flex justify-center items-center flex-wrap gap-8">   
                {packages}  
            </div>
            </div>
            </section>
    );
    
}

