<template>
  <div class="dashboard-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column
        sortable
        prop="id"
        align="center"
        label="编号"
        width="90"
      />
      <el-table-column header-align="center" label="刊物名称" min-width="200">
        <template slot-scope="scope">
          <el-link type="primary" :href="scope.row.web_site" target="_blank"
            >{{ scope.row.release_org }} - {{ scope.row.publication }}</el-link
          >
        </template>
      </el-table-column>
      <el-table-column
        sortable
        prop="latest_date"
        label="最新下载时间"
        width="180"
        align="center"
      >
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{
            scope.row.latest_date.replace("T", " ").substring(0, 19)
          }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="docs_num"
        sortable
        label="已爬取报告数量"
        width="150"
        align="center"
      />

      <el-table-column
        prop="crawler_status"
        sortable
        class-name="status-col"
        label="运行状态"
        width="110"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="scope.row.crawler_status | statusFilter">{{
            scope.row.crawler_status | statusConvert
          }}</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" prop="created_at" label="报告存放路径" min-width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template> -->
      <!-- </el-table-column> -->
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="medium"
            icon="el-icon-caret-right"
            @click="execute_task(scope.row.id, scope.$index, scope.row)"
            >运行</el-button
          >

          <el-button
            type="text"
            size="medium"
            icon="el-icon-download"
            @click="
              download(
                scope.row.id,
                'latest',
                scope.row.publication + scope.row.latest_date.substring(0, 10)
              )
            "
            >最新</el-button
          >
          <el-button
            type="text"
            size="medium"
            icon="el-icon-download"
            @click="download(scope.row.id, 'all', scope.row.publication)"
            >全部</el-button
          >
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="下载全部报告" width="150">
        <template slot-scope="scope">
          <el-button icon="el-icon-download" @click="download(scope.row.id, 'all',scope.row.publication)" />
        </template>
      </el-table-column> -->
      <el-table-column label="收件人" align="center" width="150">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="modified_receivers(scope.$index, scope.row)"
          >
            {{
              scope.row.receivers
                .map(function (elem) {
                  return elem.name;
                })
                .join(",") || "添加"
            }}
          </el-button>
        </template>
      </el-table-column>
      <!-- <el-table-column label="作者" prop="author"> </el-table-column> -->
    </el-table>

    <el-dialog
      title="维护收件人信息"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="60%"
    >
      <el-form
        ref="receivers_form_data"
        :model="receivers_form_data"
        :rules="rules"
        size="small"
        label-width="100px"
        style="text-align: center"
      >
        <el-form-item
          v-for="(item, index) in receivers_form_data"
          :key="index"
          :label="'收件人' + (index + 1)"
          size="small"
          :prop="index + '.email'"
          :rules="rules.email"
          style="width: 100%"
        >
          <el-input
            v-model="item.name"
            placeholder="姓名"
            style="margin: 0px 5px; width: 120px"
          />
          <el-input
            v-model="item.email"
            placeholder="邮箱"
            style="margin: 0px 5px; width: 180px"
          />
          <el-input
            v-model="item.phone"
            placeholder="手机"
            style="margin: 0px 5px; width: 160px"
          />
          <el-button
            size="mini"
            type="primary"
            style="margin: 0px 5px"
            icon="el-icon-plus"
            @click="on_add_field(item, index)"
          />
          <el-button
            size="mini"
            type="danger"
            style="margin: 0px 2px"
            icon="el-icon-delete"
            @click="on_delete_filed(item, index)"
          />
        </el-form-item>
      </el-form>
      <div v-show="receivers_form_data.length == 0">
        <el-button
          size="mini"
          type="primary"
          style="margin: 10px 60px"
          icon="el-icon-plus"
          @click="on_add_field({}, 0)"
          >添加收件人</el-button
        >
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="resetForm('receivers_form_data')"
          >重 置</el-button
        >
        <el-button size="mini" type="primary" @click="submit_receivers"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getList, download, execute, receivers } from "@/api/table";
import { checkPhone, checkEmail } from "@/utils";
import { mapGetters } from "vuex";
export default {
  filters: {
    statusFilter(status) {
      const statusMap = ["gray", "danger", "success"];
      return statusMap[status];
    },
    statusConvert(status) {
      const statusMap = ["运行中", "有异常", "已完成"];
      return statusMap[status];
    },
  },
  data() {
    return {
      list: null,
      dialogVisible: false,
      listLoading: true,
      timer: 0,
      idx: null,
      receiver_crawler_id: null,
      receivers_form_data: [
        {
          name: "",
          email: "",
          phone: "",
        },
      ],
      rules: {
        email: { validator: checkEmail, required: true, trigger: "blur" },
        phone: { validator: checkPhone, required: true, trigger: "blur" },
      },
    };
  },

  computed: {
    ...mapGetters(["name"]),
  },
  mounted() {
    this.fetchData();
    if (this.timer) {
      clearInterval(this.timer);
    } else {
      this.timer = setInterval(() => {
        // 调用相应的接口，渲染数据
        this.fetchData();
        console.log("hello");
      }, 10000);
    }
  },
  destroyed() {
    clearInterval(this.timer);
  },

  methods: {
    execute_task(id, idx, row) {
      if (row.crawler_status === 2 || row.crawler_status === 1) {
        // this.list[idx].crawler_status = 0;
        execute(id).then((res) => {
          this.$message.success(res.msg);
          this.list[idx].crawler_status = 0;
        });
      } else if (row.crawler_status === 0) {
        this.$message.warning(`请等待爬虫 ${id} 运行完成`);
      }
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    modified_receivers(index, row) {
      this.dialogVisible = true;
      this.idx = index;
      this.receiver_crawler_id = row.id;
      this.receivers_form_data = row.receivers;
    },
    fetchData() {
      console.log("fetchdata...");
      this.listLoading = true;
      getList().then((response) => {
        console.log(response);
        this.list = response;
        this.listLoading = false;
      });
    },
    submit_receivers() {
      this.$refs["receivers_form_data"].validate((valid) => {
        if (valid) {
          var receivers_data = {
            id: this.receiver_crawler_id,
            data: this.receivers_form_data,
          };
          receivers(receivers_data).then((res) => {
            console.log(res);
            this.list[this.idx].receivers = res;
            this.$message.success("收件人维护成功");
            this.dialogVisible = false;
          });
        }
      });
    },
    setlink(data, file_name) {
      if (!data) {
        this.$message.error("文件不存在");
        return;
      }
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      document.body.appendChild(link);
      link.setAttribute("download", file_name + ".zip");
      link.click();
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    on_add_field(item, index) {
      this.receivers_form_data.splice(index + 1, 0, {
        // id: Math.floor(Math.random() * 10000000 + 10000000),
        name: "",
        email: "",
        phone: "",
      });
      if (!this.errors.fields) {
        return;
      }
      this.errors.fields.splice(index + 1, 0, {});
    },
    on_delete_filed(field, index) {
      this.receivers_form_data.splice(index, 1);
      // if (JSON.stringify(this.errors) == "{}" && !this.errors.fields) {
      //   return;
      // }
      if (this.errors.fields) {
        this.errors.fields.splice(index, 1);
      }
    },
    download(id, flag, file_name) {
      // window.open(`/api/cbrcdoc/download/${id}/${flag}/`)
      download(id, flag).then((res) => {
        if (res.size === 0) {
          this.$message.error("文件不存在");
          return;
        }
        this.setlink(res, file_name);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
