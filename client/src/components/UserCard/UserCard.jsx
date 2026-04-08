import '../UserCard/UserCard.css'

function UserCard({data: user, onDelete, onToggle, onToggleAdmin}){

    const formatCreatedAt = (createdAt) => {
        if (!createdAt) return 'Unknown';
        const parsedDate = new Date(createdAt);
        if (Number.isNaN(parsedDate.getTime())) return createdAt;
        return parsedDate.toLocaleString();
    };

    return(
        <div className="usercard bg-black text-white p-3">
            <div className="flex flex-col lg:grid lg:items-center gap-2"
                style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 2fr 0.4fr' }}>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Username</span>
                    <span>{user.username}</span>
                </div>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Email</span>
                    <span>{user.email}</span>
                </div>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Rating</span>
                    <span>{user.rating}</span>
                </div>
                <label className='flex gap-2 items-center'>
                    <span className='toggle-switch'>
                        <input type='checkbox' checked={user.isAdmin} onChange={() => onToggleAdmin(user.userId)} />
                        <span className='toggle-track' />
                    </span>
                    Admin
                </label>
                <div className='flex flex-col lg:contents'>
                    <span className='text-gray-400 text-xs lg:hidden'>Created At</span>
                    <span>{formatCreatedAt(user.createdAt)}</span>
                </div>
                <div className='flex gap-1'>
                    <button onClick={() => onToggle(user.userId)} className={`!p-1 flex justify-center ${user.isDisabled ? '!bg-orange-500' : '!bg-green-600'}`}>
                        <span className='material-symbols-outlined'>{user.isDisabled ? 'lock_open' : 'lock'}</span>
                    </button>
                    <button onClick={() => onDelete(user.userId)} className='!bg-red-500 !p-1 flex justify-center'>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserCard;
