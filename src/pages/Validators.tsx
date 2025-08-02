import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  FiChevronRight,
  FiHome,
  FiUsers,
  FiShield,
  FiTrendingUp,
  FiPercent,
} from 'react-icons/fi'
import { selectTmClient } from '@/store/connectSlice'
import { queryActiveValidators, queryValidators } from '@/rpc/abci'
import DataTable from '@/components/Datatable'
import { createColumnHelper } from '@tanstack/react-table'
import { convertRateToPercent, convertVotingPower } from '@/utils/helper'
import { useTheme } from '@/theme/ThemeProvider'

type ValidatorData = {
  validator: string
  status: string
  votingPower: string
  commission: string
}

const columnHelper = createColumnHelper<ValidatorData>()

const Validators: React.FC = () => {
  const { colors } = useTheme()
  const tmClient = useSelector(selectTmClient)
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [totalValidator, setTotalValidator] = useState(0)
  const [totalActiveValidator, setTotalActiveValidator] = useState(0)
  const [data, setData] = useState<ValidatorData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const columns = [
    columnHelper.accessor('validator', {
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: colors.primary + '20',
              color: colors.primary,
            }}
          >
            {info.getValue().charAt(0).toUpperCase()}
          </div>
          <span className="font-medium" style={{ color: colors.text.primary }}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => (
        <div
          className="flex items-center gap-2"
          style={{ color: colors.text.secondary }}
        >
          <FiUsers className="w-4 h-4" />
          Validator
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      cell: (info) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
          style={{
            backgroundColor:
              info.getValue() === 'Active'
                ? colors.status.success + '20'
                : colors.status.error + '20',
            color:
              info.getValue() === 'Active'
                ? colors.status.success
                : colors.status.error,
          }}
        >
          <FiShield className="w-3 h-3" />
          {info.getValue()}
        </span>
      ),
      header: () => (
        <div
          className="flex items-center gap-2"
          style={{ color: colors.text.secondary }}
        >
          <FiShield className="w-4 h-4" />
          Status
        </div>
      ),
    }),
    columnHelper.accessor('votingPower', {
      cell: (info) => (
        <div className="flex items-center gap-2">
          <FiTrendingUp
            className="w-4 h-4"
            style={{ color: colors.status.info }}
          />
          <span className="font-mono" style={{ color: colors.text.primary }}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => (
        <div
          className="flex items-center gap-2"
          style={{ color: colors.text.secondary }}
        >
          <FiTrendingUp className="w-4 h-4" />
          Voting Power
        </div>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('commission', {
      cell: (info) => (
        <div className="flex items-center gap-2">
          <FiPercent
            className="w-4 h-4"
            style={{ color: colors.status.warning }}
          />
          <span className="font-mono" style={{ color: colors.text.primary }}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => (
        <div
          className="flex items-center gap-2"
          style={{ color: colors.text.secondary }}
        >
          <FiPercent className="w-4 h-4" />
          Commission
        </div>
      ),
      meta: {
        isNumeric: true,
      },
    }),
  ]

  useEffect(() => {
    if (tmClient) {
      setIsLoading(true)
      queryActiveValidators(tmClient, page, perPage)
        .then((response) => {
          setTotalActiveValidator(Number(response.pagination?.total))
          const validatorData: ValidatorData[] = response.validators.map(
            (val) => {
              return {
                validator: val.description?.moniker ?? '',
                status: val.status === 3 ? 'Active' : 'Inactive',
                votingPower: convertVotingPower(val.tokens),
                commission: convertRateToPercent(
                  val.commission?.commissionRates?.rate
                ),
              }
            }
          )
          setData(validatorData)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to fetch validators:', error)
          setIsLoading(false)
        })
    }
  }, [tmClient, page, perPage])

  useEffect(() => {
    if (tmClient) {
      queryValidators(tmClient, page, perPage)
        .then((response) => {
          setTotalValidator(Number(response.pagination?.total))
        })
        .catch((error) => {
          console.error('Failed to fetch validators:', error)
        })
    }
  }, [tmClient])

  const onChangePagination = (value: {
    pageIndex: number
    pageSize: number
  }) => {
    setPage(value.pageIndex)
    setPerPage(value.pageSize)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Validators
        </h1>
        <div
          className="h-4 w-px"
          style={{ backgroundColor: colors.border.primary }}
        ></div>
        <Link
          to="/"
          className="flex items-center hover:opacity-70 transition-opacity"
          style={{ color: colors.text.secondary }}
        >
          <FiHome className="w-4 h-4" />
        </Link>
        <FiChevronRight
          className="w-4 h-4"
          style={{ color: colors.text.tertiary }}
        />
        <span style={{ color: colors.text.secondary }}>Validators</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.status.success + '20' }}
            >
              <FiShield
                className="w-6 h-6"
                style={{ color: colors.status.success }}
              />
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Active Validators
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {totalActiveValidator}
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.status.info + '20' }}
            >
              <FiUsers
                className="w-6 h-6"
                style={{ color: colors.status.info }}
              />
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Total Validators
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {totalValidator}
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: colors.shadow.sm,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.status.warning + '20' }}
            >
              <FiTrendingUp
                className="w-6 h-6"
                style={{ color: colors.status.warning }}
              />
            </div>
            <div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Avg Commission
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.text.primary }}
              >
                {data.length > 0
                  ? (
                      data.reduce(
                        (acc, v) =>
                          acc + parseFloat(v.commission.replace('%', '')),
                        0
                      ) / data.length
                    ).toFixed(1) + '%'
                  : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validators Table */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm,
        }}
      >
        <div className="mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: colors.text.primary }}
          >
            Validator List
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
            Active validators securing the network
          </p>
        </div>

        {tmClient ? (
          <DataTable
            columns={columns}
            data={data}
            total={totalActiveValidator}
            isLoading={isLoading}
            onChangePagination={onChangePagination}
          />
        ) : (
          <div className="text-center py-12">
            <FiUsers
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              style={{ color: colors.text.tertiary }}
            />
            <p style={{ color: colors.text.secondary }}>
              No connection to blockchain
            </p>
            <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
              Please connect to view validators
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Validators
